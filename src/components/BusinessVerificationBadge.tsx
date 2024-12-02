import { CheckCircle, Shield, Crown } from 'lucide-react';
import { VerificationBadge } from '../types';

interface BusinessVerificationBadgeProps {
  badge: VerificationBadge;
  className?: string;
}

export function BusinessVerificationBadge({ badge, className = '' }: BusinessVerificationBadgeProps) {
  const getBadgeContent = () => {
    switch (badge.type) {
      case 'official':
        return {
          icon: <Shield className="w-4 h-4" />,
          text: 'Official Business',
          colors: 'bg-blue-100 text-blue-800',
        };
      case 'claimed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Verified Owner',
          colors: 'bg-green-100 text-green-800',
        };
      case 'premium':
        return {
          icon: <Crown className="w-4 h-4" />,
          text: 'Premium Business',
          colors: 'bg-purple-100 text-purple-800',
        };
      default:
        return null;
    }
  };

  const content = getBadgeContent();
  if (!content) return null;

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${content.colors} ${className}`}
    >
      {content.icon}
      <span className="ml-1">{content.text}</span>
    </div>
  );
}