import { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Share2,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import { Business } from '../types';
import { BusinessPhotoGallery } from './BusinessPhotoGallery';
import { BusinessQA } from './BusinessQA';
import toast from 'react-hot-toast';

interface BusinessFeaturesProps {
  business: Business;
}

export function BusinessFeatures({ business }: BusinessFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'qa'>('info');
  const [isSaved, setIsSaved] = useState(false);

  const getPriceRangeDisplay = (range: string) => {
    const symbols = Array(4).fill('$').map((symbol, index) => (
      <span
        key={index}
        className={`${
          index < range.length
            ? 'text-green-600'
            : 'text-gray-300'
        }`}
      >
        {symbol}
      </span>
    ));
    return <div className="flex">{symbols}</div>;
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Added to saved');
  };

  const handleReport = () => {
    toast.success('Thank you for reporting. We will review this business.');
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'photos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'qa'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Q&A
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isSaved
                  ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleReport}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Report
            </button>
          </div>

          {/* Operating Hours */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Operating Hours</span>
            </div>
            <div className="ml-7 space-y-1">
              {business.operatingHours.map((hours) => (
                <div
                  key={hours.day}
                  className="grid grid-cols-2 text-sm"
                >
                  <span className="capitalize">{hours.day}</span>
                  <span>{`${hours.open} - ${hours.close}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location</span>
            </div>
            <div className="ml-7">
              <p className="text-sm">{business.location.address}</p>
              <p className="text-sm">
                {business.location.city}, {business.location.state} {business.location.zipCode}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-5 h-5" />
              <a
                href={`tel:${business.contact.phone}`}
                className="text-sm hover:text-blue-600"
              >
                {business.contact.phone}
              </a>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-5 h-5" />
              <a
                href={`mailto:${business.contact.email}`}
                className="text-sm hover:text-blue-600"
              >
                {business.contact.email}
              </a>
            </div>
            {business.contact.website && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Globe className="w-5 h-5" />
                <a
                  href={business.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Features */}
          {business.features.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <div className="grid grid-cols-2 gap-2">
                {business.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <span>•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <BusinessPhotoGallery business={business} />
      )}

      {activeTab === 'qa' && (
        <BusinessQA business={business} />
      )}
    </div>
  );
}
