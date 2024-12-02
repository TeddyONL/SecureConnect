import { Clock, Users, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Business } from '../types';

interface BusinessStatusBadgeProps {
  business: Business;
}

export function BusinessStatusBadge({ business }: BusinessStatusBadgeProps) {
  const [status, setStatus] = useState<'open' | 'closed' | 'busy'>('closed');
  const [waitTime, setWaitTime] = useState<number | null>(null);

  useEffect(() => {
    const getCurrentStatus = () => {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const hours = business.operatingHours.find(h => h.day === currentDay);

      if (!hours || hours.isClosed) return 'closed';

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      if (currentTime < openTime || currentTime > closeTime) return 'closed';

      // Simulate busy status based on time of day
      const peakHours = [
        { start: 12 * 60, end: 14 * 60 }, // Lunch rush
        { start: 18 * 60, end: 20 * 60 }, // Dinner rush
      ];

      const isBusy = peakHours.some(
        peak => currentTime >= peak.start && currentTime <= peak.end
      );

      return isBusy ? 'busy' : 'open';
    };

    const estimateWaitTime = () => {
      if (status === 'busy') {
        // Simulate wait time based on business type and current time
        const baseTime = Math.floor(Math.random() * 20) + 10;
        const rushHourMultiplier = status === 'busy' ? 1.5 : 1;
        return Math.floor(baseTime * rushHourMultiplier);
      }
      return null;
    };

    const updateStatus = () => {
      const newStatus = getCurrentStatus();
      setStatus(newStatus as 'open' | 'closed' | 'busy');
      setWaitTime(estimateWaitTime());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [business]);

  const statusConfig = {
    open: {
      color: 'bg-green-100 text-green-800',
      icon: Clock,
      text: 'Open Now'
    },
    closed: {
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
      text: 'Closed'
    },
    busy: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Users,
      text: 'Busy'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-start space-y-1">
      <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.text}
      </div>
      {waitTime && status === 'busy' && (
        <span className="text-xs text-gray-500">
          Est. wait: {waitTime} minutes
        </span>
      )}
    </div>
  );
}