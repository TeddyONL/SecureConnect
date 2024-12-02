import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  businessId: string;
  inStock: boolean;
  images: string[];
  variants?: {
    name: string;
    options: string[];
    prices?: Record<string, number>;
  }[];
}

interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  businessId?: string;
  tags?: string[];
  minRating?: number;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchProducts: (query: string) => Product[];
  filterProducts: (filters: ProductFilters) => Product[];
  getBusinessById: (businessId: string) => any;
  getRecommendedProducts: (productId: string, limit?: number) => Product[];
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,

      searchProducts: (query: string) => {
        const searchTerms = query.toLowerCase().split(' ');
        const products = get().products;
        
        // Score-based search results
        const scoredProducts = products.map(product => {
          let score = 0;
          
          // Search in various fields with different weights
          searchTerms.forEach(term => {
            // Name matches (highest weight)
            if (product.name.toLowerCase().includes(term)) score += 10;
            
            // Category matches
            if (product.category.toLowerCase().includes(term)) score += 5;
            
            // Description matches
            if (product.description.toLowerCase().includes(term)) score += 3;
            
            // Tag matches
            if (product.tags.some(tag => tag.toLowerCase().includes(term))) score += 2;
            
            // Partial matches
            if (fuzzyMatch(product.name.toLowerCase(), term)) score += 1;
          });

          return { product, score };
        });

        // Return only products with a score > 0, sorted by score
        return scoredProducts
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({ product }) => product);
      },

      filterProducts: (filters: ProductFilters) => {
        const products = get().products;

        return products.filter(product => {
          // Category filter
          if (filters.category && product.category !== filters.category) {
            return false;
          }

          // Price range filter
          if (filters.priceRange) {
            const { min, max } = filters.priceRange;
            if (product.price < min || (max !== Infinity && product.price > max)) {
              return false;
            }
          }

          // Stock filter
          if (filters.inStock && !product.inStock) {
            return false;
          }

          // Business filter
          if (filters.businessId && product.businessId !== filters.businessId) {
            return false;
          }

          // Tags filter
          if (filters.tags?.length) {
            if (!filters.tags.some(tag => product.tags.includes(tag))) {
              return false;
            }
          }

          // Rating filter
          if (filters.minRating) {
            const business = get().getBusinessById(product.businessId);
            if (!business || (business.stats?.averageRating || 0) < filters.minRating) {
              return false;
            }
          }

          return true;
        });
      },

      getBusinessById: (businessId: string) => {
        // This would typically come from your business store
        // For now, return a mock business
        return {
          id: businessId,
          stats: {
            averageRating: 4.5
          }
        };
      },

      getRecommendedProducts: (productId: string, limit: number = 5) => {
        const products = get().products;
        const currentProduct = products.find(p => p.id === productId);
        
        if (!currentProduct) return [];

        // Score-based recommendations
        const scoredProducts = products
          .filter(p => p.id !== productId)
          .map(product => {
            let score = 0;

            // Same category
            if (product.category === currentProduct.category) score += 5;

            // Similar price range (within 20%)
            const priceDiff = Math.abs(product.price - currentProduct.price);
            const priceRatio = priceDiff / currentProduct.price;
            if (priceRatio <= 0.2) score += 3;

            // Shared tags
            const sharedTags = product.tags.filter(tag => 
              currentProduct.tags.includes(tag)
            ).length;
            score += sharedTags * 2;

            return { product, score };
          });

        // Return top N recommendations
        return scoredProducts
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ product }) => product);
      }
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Utility function for fuzzy matching
function fuzzyMatch(str: string, pattern: string): boolean {
  let patternIdx = 0;
  let strIdx = 0;
  const pattern_length = pattern.length;
  const str_length = str.length;

  while (patternIdx < pattern_length && strIdx < str_length) {
    if (pattern[patternIdx] === str[strIdx]) {
      patternIdx++;
    }
    strIdx++;
  }

  return patternIdx === pattern_length;
}
