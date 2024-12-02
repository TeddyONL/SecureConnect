import { useEffect } from 'react';
import { useAdStore } from '../../stores/adStore';
import { useProductStore } from '../../stores/productStore';
import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';

interface SponsoredProductsProps {
  category?: string;
}

export function SponsoredProducts({ category }: SponsoredProductsProps) {
  const { getSponsored, trackImpression, trackClick } = useAdStore();
  const { products } = useProductStore();
  const sponsoredProducts = getSponsored(category);

  useEffect(() => {
    // Track impressions when sponsored products are viewed
    sponsoredProducts.forEach(promo => trackImpression(promo.id));
  }, [sponsoredProducts]);

  if (sponsoredProducts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary-600">
        <Sparkles className="w-5 h-5" />
        <h3 className="text-lg font-medium">Sponsored Products</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sponsoredProducts.map((promo) => {
          const product = products.find(p => p.id === promo.productId);
          if (!product) return null;

          return (
            <div
              key={promo.id}
              className="relative group"
              onClick={() => trackClick(promo.id)}
            >
              {/* Sponsored Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-primary-600 shadow-sm backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sponsored
                </span>
              </div>

              {/* Product Card with Enhanced Styling */}
              <div className="transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg">
                <ProductCard product={product} view="grid" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}