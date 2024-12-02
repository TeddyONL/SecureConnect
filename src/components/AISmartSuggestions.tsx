import { useState, useEffect } from 'react';
import { AI } from '../lib/ai';
import { Business } from '../types';
import { useLocation } from '../hooks/useLocation';
import { BusinessCard } from './BusinessCard';
import { Loader } from './Loader';
import { Sparkles, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

interface AISmartSuggestionsProps {
  businesses: Business[];
}

export function AISmartSuggestions({ businesses }: AISmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { coordinates } = useLocation();

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        // Get current time
        const now = new Date();
        const hour = now.getHours();
        let timeOfDay = 'morning';
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        if (hour >= 17) timeOfDay = 'evening';

        const userPreferences = generateUserPreferences();
        const suggestedBusinesses = await AI.generateBusinessSuggestions(
          userPreferences,
          {
            location: coordinates || undefined,
            timeOfDay,
            businesses
          }
        );

        setSuggestions(suggestedBusinesses);
      } catch (error) {
        toast.error('Failed to generate suggestions');
        console.error('Suggestions error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [businesses, coordinates]);

  const generateUserPreferences = () => {
    // In a real app, this would be based on user behavior, history, and preferences
    return `
      - Highly rated businesses
      - Currently open
      - Popular among locals
      - Match current time of day
      ${coordinates ? '- Near current location' : ''}
    `;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader />
        <p className="mt-4 text-gray-600">Generating personalized suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
        </div>
        {coordinates && (
          <div className="flex items-center text-sm text-green-600">
            <Navigation className="h-4 w-4 mr-1" />
            <span>Location-aware</span>
          </div>
        )}
      </div>

      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No suggestions available at this time.
        </div>
      )}
    </div>
  );
}