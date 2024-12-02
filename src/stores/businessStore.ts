import { create } from 'zustand';
import { Business, Review, BusinessClaim, VerificationBadge } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';
import { publicInstitutions } from '../data/publicInstitutions';
import { calculateDistance } from '../hooks/useLocation';

interface BusinessStore {
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => Promise<Business>;
  removeBusiness: (id: string) => void;
  addReview: (businessId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Review>;
  removeReview: (businessId: string, reviewId: string) => void;
  toggleBookmark: (userId: string, businessId: string) => void;
  submitClaim: (claim: Omit<BusinessClaim, 'id' | 'createdAt'>) => Promise<BusinessClaim>;
  verifyBusiness: (businessId: string, badge: VerificationBadge) => void;
  searchBusinesses: (query: string, userLocation?: { latitude: number; longitude: number }) => Business[];
  filterByLocation: (county: string) => Business[];
  filterByInstitutionType: (type: string) => Business[];
  initialize: () => void;
}

interface ScoredBusiness extends Business {
  score: number;
  distance?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateBusinessScore = (
  business: Business,
  searchTerm: string,
  userLocation?: { latitude: number; longitude: number }
): ScoredBusiness => {
  let score = 0;
  const termLower = searchTerm.toLowerCase();

  if (business.name.toLowerCase().includes(termLower)) {
    score += 10;
  }
  if (business.category.toLowerCase().includes(termLower)) {
    score += 5;
  }
  if (business.description.toLowerCase().includes(termLower)) {
    score += 3;
  }
  if (business.features.some(feature => feature.toLowerCase().includes(termLower))) {
    score += 2;
  }

  const reviewScore = business.stats?.averageRating || 0;
  score += reviewScore;

  const reviewCount = business.stats?.totalReviews || 0;
  score += Math.min(reviewCount / 10, 3);

  if (business.isVerified) {
    score += 2;
  }

  let distance: number | undefined;

  if (userLocation && business.location.latitude && business.location.longitude) {
    distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      business.location.latitude,
      business.location.longitude
    );
    const distanceScore = Math.max(0, 5 - (distance / 2));
    score += distanceScore;
  }

  return {
    ...business,
    score,
    distance
  };
};

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set, get) => ({
      businesses: [],
      isLoading: false,
      error: null,
      initialized: false,

      initialize: () => {
        const { businesses } = get();
        if (businesses.length === 0) {
          set({
            businesses: publicInstitutions.map(institution => ({
              ...institution,
              id: generateId(),
              createdAt: new Date().toISOString(),
              reviews: [],
              claims: [],
              stats: {
                totalReviews: 0,
                averageRating: 0,
                totalViews: 0,
                totalBookmarks: 0,
              },
            })),
            initialized: true,
          });
        } else {
          set({ initialized: true });
        }
      },

      addBusiness: async (business) => {
        const newBusiness: Business = {
          ...business,
          id: generateId(),
          createdAt: new Date().toISOString(),
          reviews: [],
          claims: [],
          stats: {
            totalReviews: 0,
            averageRating: 0,
            totalViews: 0,
            totalBookmarks: 0,
          },
        };

        set(state => ({
          businesses: [...state.businesses, newBusiness]
        }));

        return newBusiness;
      },

      removeBusiness: (id) => {
        set(state => ({
          businesses: state.businesses.filter(b => b.id !== id)
        }));
      },

      addReview: async (businessId, review) => {
        const newReview: Review = {
          ...review,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          businesses: state.businesses.map(business => {
            if (business.id === businessId) {
              const reviews = [...business.reviews, newReview];
              const totalReviews = reviews.length;
              const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

              return {
                ...business,
                reviews,
                stats: {
                  ...business.stats,
                  totalReviews,
                  averageRating
                }
              };
            }
            return business;
          })
        }));

        return newReview;
      },

      removeReview: (businessId, reviewId) => {
        set(state => ({
          businesses: state.businesses.map(business => {
            if (business.id === businessId) {
              const reviews = business.reviews.filter(r => r.id !== reviewId);
              const totalReviews = reviews.length;
              const averageRating = totalReviews > 0
                ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
                : 0;

              return {
                ...business,
                reviews,
                stats: {
                  ...business.stats,
                  totalReviews,
                  averageRating
                }
              };
            }
            return business;
          })
        }));
      },

      toggleBookmark: (userId, businessId) => {
        set(state => ({
          businesses: state.businesses.map(business => {
            if (business.id === businessId) {
              const totalBookmarks = business.stats.totalBookmarks + 1;
              return {
                ...business,
                stats: {
                  ...business.stats,
                  totalBookmarks
                }
              };
            }
            return business;
          })
        }));
      },

      submitClaim: async (claim) => {
        const newClaim: BusinessClaim = {
          ...claim,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          businesses: state.businesses.map(business => {
            if (business.id === claim.businessId) {
              return {
                ...business,
                claims: [...business.claims, newClaim]
              };
            }
            return business;
          })
        }));

        return newClaim;
      },

      verifyBusiness: (businessId, badge) => {
        set(state => ({
          businesses: state.businesses.map(business => {
            if (business.id === businessId) {
              return {
                ...business,
                isVerified: true,
                verificationBadges: [...(business.verificationBadges || []), badge]
              };
            }
            return business;
          })
        }));
      },

      searchBusinesses: (query, userLocation) => {
        const { businesses } = get();
        if (!query.trim()) return businesses;

        return businesses
          .map(business => calculateBusinessScore(business, query, userLocation))
          .filter(business => business.score > 0)
          .sort((a, b) => b.score - a.score);
      },

      filterByLocation: (county) => {
        const { businesses } = get();
        return businesses.filter(business => 
          business.location.county.toLowerCase() === county.toLowerCase()
        );
      },

      filterByInstitutionType: (type) => {
        const { businesses } = get();
        return businesses.filter(business => 
          business.category.toLowerCase() === type.toLowerCase()
        );
      },
    }),
    {
      name: 'business-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    }
  )
);
