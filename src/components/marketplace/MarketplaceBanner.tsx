import { useEffect } from 'react';
import { useAdStore } from '../../stores/adStore';
import { Ad } from '../../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketplaceBannerProps {
  placement: Ad['placement'];
}

export function MarketplaceBanner({ placement }: MarketplaceBannerProps) {
  const { getActiveAds, trackImpression, trackClick } = useAdStore();
  const ads = getActiveAds(placement);

  useEffect(() => {
    // Track impressions when ads are viewed
    ads.forEach(ad => trackImpression(ad.id));
  }, [ads]);

  if (ads.length === 0) return null;

  const handleClick = (adId: string) => {
    trackClick(adId);
  };

  return (
    <div className="w-full space-y-4">
      {ads.map((ad) => (
        <Link
          key={ad.id}
          to={ad.linkUrl}
          onClick={() => handleClick(ad.id)}
          className="block relative group"
        >
          <div className="relative overflow-hidden rounded-xl">
            {/* Ad Image */}
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div>
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  Sponsored
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white">
                  {ad.title}
                </h3>
                {ad.description && (
                  <p className="mt-2 text-white/90">
                    {ad.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center text-white group-hover:text-primary-200 transition-colors">
                <span className="text-sm font-medium">Learn More</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}