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

  // Name match (highest weight)
  if (business.name.toLowerCase().includes(termLower)) {
    score += 10;
  }

  // Category match
  if (business.category.toLowerCase().includes(termLower)) {
    score += 5;
  }

  // Description match
  if (business.description.toLowerCase().includes(termLower)) {
    score += 3;
  }

  // Features match
  if (business.features.some(feature => feature.toLowerCase().includes(termLower))) {
    score += 2;
  }

  // Review score component (0-5 points)
  const reviewScore = business.stats?.averageRating || 0;
  score += reviewScore;

  // Review count weight (0-3 points)
  const reviewCount = business.stats?.totalReviews || 0;
  score += Math.min(reviewCount / 10, 3);

  // Verification bonus
  if (business.isVerified) {
    score += 2;
  }

  let distance: number | undefined;

  // Location score component
  if (userLocation && business.location.latitude && business.location.longitude) {
    distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      business.location.latitude,
      business.location.longitude
    );

    // Distance scoring (inversely proportional to distance)
    // Max 5 points for locations within 1km, decreasing as distance increases
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

      // ... (keep existing methods)

      searchBusinesses: (query, userLocation) => {
        const { businesses } = get();
        if (!query.trim()) return businesses;

        // Score and sort businesses
        const scoredBusinesses = businesses
          .map(business => calculateBusinessScore(business, query, userLocation))
          .filter(business => business.score > 0)
          .sort((a, b) => b.score - a.score);

        return scoredBusinesses;
      },

      // ... (keep other existing methods)
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