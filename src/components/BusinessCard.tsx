import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../types';
import { User } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  view?: 'grid' | 'list';
}

export function BusinessCard({ business }: BusinessCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/business/${business.id}`);
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile');
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
    >
      <div className="relative">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        {business.isVerified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
            Verified
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {business.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2">
          {business.description.length > 100
            ? `${business.description.substring(0, 100)}...`
            : business.description}
        </p>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-2">{business.category}</span>
          <span>•</span>
          <span className="ml-2">{business.location.city}, {business.location.state}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <div className="flex items-center mr-4">
            <span className="font-medium mr-1">{business.stats.averageRating}</span>
            <span>({business.stats.totalReviews} reviews)</span>
          </div>
        </div>

        {business.owner && (
          <div 
            onClick={handleOwnerClick}
            className="mt-2 flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600"
          >
            <User className="w-4 h-4 mr-1" />
            <span>View Owner Profile</span>
          </div>
        )}
      </div>
    </div>
  );
}
