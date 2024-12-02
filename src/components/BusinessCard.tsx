import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../types';
import { formatDistance } from 'date-fns';
import { 
  ShoppingCart, 
  Heart,
  Share2,
  MapPin,
  Building2,
  Tag,
  ChevronRight,
  ImageOff,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessCardProps {
  business: Business;
  view?: 'grid' | 'list';
}

export function BusinessCard({ business, view = 'grid' }: BusinessCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  // ... (keep existing event handlers)

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile'); // Update this to navigate to profile instead of a specific user
  };

  // ... (keep existing render logic, but update the owner click handler)
  return (
    <div className="card group">
      {/* ... other card content ... */}
      
      {business.owner && (
        <div 
          onClick={handleOwnerClick}
          className="mt-2 flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600"
        >
          <User className="w-4 h-4 mr-1" />
          <span>View Owner Profile</span>
        </div>
      )}
      
      {/* ... rest of the card content ... */}
    </div>
  );
}