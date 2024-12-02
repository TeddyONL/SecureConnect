import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ad, ProductPromotion, AdStore } from '../types';

// Mock data generator for ads
const generateSampleAds = (): Ad[] => [
  {
    id: '1',
    type: 'banner',
    title: 'Summer Sale - Up to 50% Off',
    description: 'Don\'t miss out on our biggest sale of the season!',
    imageUrl: 'https://images.unsplash.com/photo-1607082352121-fa243f3c427c',
    linkUrl: '/marketplace?sale=summer',
    businessId: '1',
    placement: 'top',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    targeting: {
      categories: ['Electronics', 'Fashion'],
      locations: ['Nairobi', 'Mombasa'],
    },
    metrics: {
      impressions: 1200,
      clicks: 85,
      ctr: 7.08,
      spend: 450,
    },
    bid: {
      amount: 2.5,
      currency: 'KES',
      type: 'cpc',
    },
  },
  // Add more sample ads...
];

const generateSamplePromotions = (): ProductPromotion[] => [
  {
    id: '1',
    productId: '1',
    type: 'spotlight',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 1,
    bid: {
      amount: 1.5,
      currency: 'KES',
      type: 'cpc',
    },
    targeting: {
      categories: ['Electronics'],
      searchTerms: ['camera', 'dslr', 'photography'],
    },
    metrics: {
      impressions: 800,
      clicks: 45,
      conversions: 3,
      spend: 67.5,
    },
  },
  // Add more sample promotions...
];

export const useAdStore = create<AdStore>()(
  persist(
    (set, get) => ({
      ads: generateSampleAds(),
      promotions: generateSamplePromotions(),
      isLoading: false,
      error: null,

      createAd: async (ad) => {
        const newAd: Ad = {
          ...ad,
          id: Math.random().toString(36).substring(7),
          metrics: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            spend: 0,
          },
        };

        set((state) => ({
          ads: [...state.ads, newAd],
        }));

        return newAd;
      },

      updateAd: async (id, updates) => {
        let updatedAd: Ad | undefined;

        set((state) => {
          const newAds = state.ads.map((ad) => {
            if (ad.id === id) {
              updatedAd = { ...ad, ...updates };
              return updatedAd;
            }
            return ad;
          });

          return { ads: newAds };
        });

        if (!updatedAd) {
          throw new Error('Ad not found');
        }

        return updatedAd;
      },

      deleteAd: async (id) => {
        set((state) => ({
          ads: state.ads.filter((ad) => ad.id !== id),
        }));
      },

      createPromotion: async (promotion) => {
        const newPromotion: ProductPromotion = {
          ...promotion,
          id: Math.random().toString(36).substring(7),
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
          },
        };

        set((state) => ({
          promotions: [...state.promotions, newPromotion],
        }));

        return newPromotion;
      },

      updatePromotion: async (id, updates) => {
        let updatedPromotion: ProductPromotion | undefined;

        set((state) => {
          const newPromotions = state.promotions.map((promo) => {
            if (promo.id === id) {
              updatedPromotion = { ...promo, ...updates };
              return updatedPromotion;
            }
            return promo;
          });

          return { promotions: newPromotions };
        });

        if (!updatedPromotion) {
          throw new Error('Promotion not found');
        }

        return updatedPromotion;
      },

      deletePromotion: async (id) => {
        set((state) => ({
          promotions: state.promotions.filter((promo) => promo.id !== id),
        }));
      },

      getActiveAds: (placement) => {
        const now = new Date().toISOString();
        return get().ads.filter(
          (ad) =>
            ad.placement === placement &&
            ad.status === 'active' &&
            ad.startDate <= now &&
            ad.endDate >= now
        );
      },

      getSponsored: (category) => {
        const now = new Date().toISOString();
        return get().promotions
          .filter((promo) => {
            const isActive = promo.startDate <= now && promo.endDate >= now;
            const matchesCategory = !category || promo.targeting.categories?.includes(category);
            return isActive && matchesCategory;
          })
          .sort((a, b) => {
            // Sort by priority and bid amount
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            return b.bid.amount - a.bid.amount;
          });
      },

      trackImpression: (adId) => {
        set((state) => {
          const newAds = state.ads.map((ad) => {
            if (ad.id === adId) {
              const impressions = ad.metrics.impressions + 1;
              const ctr = (ad.metrics.clicks / impressions) * 100;
              return {
                ...ad,
                metrics: {
                  ...ad.metrics,
                  impressions,
                  ctr,
                },
              };
            }
            return ad;
          });

          const newPromotions = state.promotions.map((promo) => {
            if (promo.id === adId) {
              return {
                ...promo,
                metrics: {
                  ...promo.metrics,
                  impressions: promo.metrics.impressions + 1,
                },
              };
            }
            return promo;
          });

          return { ads: newAds, promotions: newPromotions };
        });
      },

      trackClick: (adId) => {
        set((state) => {
          const newAds = state.ads.map((ad) => {
            if (ad.id === adId) {
              const clicks = ad.metrics.clicks + 1;
              const ctr = (clicks / ad.metrics.impressions) * 100;
              const spend = clicks * ad.bid.amount;
              return {
                ...ad,
                metrics: {
                  ...ad.metrics,
                  clicks,
                  ctr,
                  spend,
                },
              };
            }
            return ad;
          });

          const newPromotions = state.promotions.map((promo) => {
            if (promo.id === adId) {
              const clicks = promo.metrics.clicks + 1;
              const spend = clicks * promo.bid.amount;
              return {
                ...promo,
                metrics: {
                  ...promo.metrics,
                  clicks,
                  spend,
                },
              };
            }
            return promo;
          });

          return { ads: newAds, promotions: newPromotions };
        });
      },
    }),
    {
      name: 'ad-storage',
    }
  )
);