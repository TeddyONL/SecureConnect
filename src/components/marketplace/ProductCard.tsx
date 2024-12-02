import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Business } from '../../types';
import { formatDistance } from 'date-fns';
import { 
  ShoppingCart, 
  Heart,
  Share2,
  MapPin,
  Building2,
  Tag,
  ChevronRight,
  ImageOff
} from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  business?: Business;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, business, view = 'grid' }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContactBusiness = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business) {
      navigate(`/chat?businessId=${business.id}`);
    }
  };

  if (view === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex p-4">
          {/* Product Image */}
          <div className="w-48 h-48 flex-shrink-0">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 ml-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full ${
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <Tag className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-lg font-bold text-gray-900">
                {product.currency} {product.price.toLocaleString()}
              </span>
              {product.discountedPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {product.currency} {product.discountedPrice.toLocaleString()}
                </span>
              )}
            </div>

            {business && (
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Building2 className="w-4 h-4 mr-2" />
                <span>{business.name}</span>
                <MapPin className="w-4 h-4 ml-4 mr-2" />
                <span>{business.location.city}</span>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={handleContactBusiness}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                Contact Business
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image Gallery */}
      <div className="relative aspect-square rounded-t-lg overflow-hidden">
        {product.images.length > 0 ? (
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={5000}
          >
            {product.images.map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full bg-white/90 backdrop-blur-sm ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-500 text-white text-sm rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {product.currency} {product.price.toLocaleString()}
            </span>
            {product.discountedPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {product.currency} {product.discountedPrice.toLocaleString()}
              </span>
            )}
          </div>
          {business && (
            <div className="flex items-center text-sm text-gray-500">
              <Building2 className="w-4 h-4 mr-1" />
              <span>{business.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleContactBusiness}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Contact
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}