import { useState } from 'react';
import { Search, List, Grid, SlidersHorizontal, Bell } from 'lucide-react';
import { SmartSearch } from '../SmartSearch';

interface MarketplaceHeaderProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onToggleFilters: () => void;
  totalProducts: number;
}

export function MarketplaceHeader({ view, onViewChange, onToggleFilters, totalProducts }: MarketplaceHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search and Total Count */}
          <div className="flex-1 max-w-2xl">
            <SmartSearch placeholder="Search products, brands, or categories..." />
            <p className="mt-2 text-sm text-gray-500">
              {totalProducts} products available
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-600">New products in Electronics</p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-600">Price drop on watched items</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-1.5 rounded ${
                  view === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded ${
                  view === 'list'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={onToggleFilters}
              className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}