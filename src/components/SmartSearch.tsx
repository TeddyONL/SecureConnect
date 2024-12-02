import { useState, useEffect, useRef } from 'react';
import { Search, Clock, MapPin, Tag, Sparkles, Navigation, Star } from 'lucide-react';
import { useBusinessStore } from '../stores/businessStore';
import { Business } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../hooks/useLocation';

interface SearchResult extends Business {
  distance?: number;
}

export function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { businesses, searchBusinesses } = useBusinessStore();
  const { coordinates, requesting, requestPermission } = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Request location permission on mount
    if (!coordinates && !requesting) {
      requestPermission();
    }

    // Handle clicks outside of search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [coordinates, requesting, requestPermission]);

  useEffect(() => {
    if (query.length >= 2) {
      // Perform location-aware search
      const searchResults = searchBusinesses(query, coordinates || undefined);
      setResults(searchResults.slice(0, 5));

      // Generate suggestions
      const generateSuggestions = () => {
        const words = query.toLowerCase().split(' ');
        const lastWord = words[words.length - 1];
        
        // Categories suggestion
        const categories = Array.from(new Set(businesses.map(b => b.category)));
        const categorySuggestions = categories
          .filter(c => c.toLowerCase().includes(lastWord))
          .map(c => [...words.slice(0, -1), c].join(' '));

        // Feature suggestions
        const features = Array.from(new Set(businesses.flatMap(b => b.features)));
        const featureSuggestions = features
          .filter(f => f.toLowerCase().includes(lastWord))
          .map(f => [...words.slice(0, -1), f].join(' '));

        // Location suggestions
        const locations = Array.from(new Set(businesses.map(b => b.location.city)));
        const locationSuggestions = locations
          .filter(l => l.toLowerCase().includes(lastWord))
          .map(l => [...words.slice(0, -1), l].join(' '));

        return [...new Set([...categorySuggestions, ...featureSuggestions, ...locationSuggestions])].slice(0, 5);
      };

      setSuggestions(generateSuggestions());
      setIsOpen(true);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query, coordinates, businesses, searchBusinesses]);

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 
      ? `${Math.round(distance * 1000)}m away`
      : `${distance.toFixed(1)}km away`;
  };

  const handleSearch = (searchQuery: string) => {
    // Save to recent searches
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results
    navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search businesses, categories, or locations..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {!coordinates && !requesting && (
        <button
          onClick={requestPermission}
          className="absolute right-3 top-2 text-blue-600 hover:text-blue-700 text-sm flex items-center"
        >
          <Navigation className="w-4 h-4 mr-1" />
          Enable location
        </button>
      )}

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-md flex items-center"
                >
                  <Tag className="w-4 h-4 mr-2 text-blue-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2 border-b">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Search className="w-3 h-3 mr-1" />
                Results
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearch(result.name)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{result.name}</div>
                    {result.distance !== undefined && (
                      <span className="text-xs text-gray-500">
                        {formatDistance(result.distance)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {result.location.city}
                    {result.stats.averageRating > 0 && (
                      <span className="ml-2 flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        {result.stats.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3 mr-1" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-md flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
