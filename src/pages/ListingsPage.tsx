import { useState, useEffect } from 'react';
import { useBusinessStore } from '../stores/businessStore';
import { BusinessCard } from '../components/BusinessCard';
import { Building2, ListFilter, Search, Map } from 'lucide-react';
import { Business } from '../types';

type FilterType = 'all' | 'public' | 'private';
type InstitutionType = 'all' | 'government' | 'education' | 'healthcare' | 'other';
type CountyType = 'all' | 'nairobi' | 'kiambu';

export function ListingsPage() {
  const { businesses, searchBusinesses, filterByLocation, filterByInstitutionType } = useBusinessStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('all');
  const [county, setCounty] = useState<CountyType>('all');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  // Effect to handle filtering and searching
  useEffect(() => {
    let filtered = searchQuery ? searchBusinesses(searchQuery) : businesses;

    // Apply county filter
    if (county !== 'all') {
      filtered = filterByLocation(county);
    }

    // Apply public/private filter
    if (filterType === 'public') {
      if (institutionType === 'all') {
        filtered = filtered.filter(b => b.isPublicInstitution);
      } else {
        filtered = filterByInstitutionType(institutionType);
      }
    } else if (filterType === 'private') {
      filtered = filtered.filter(b => !b.isPublicInstitution);
    }

    setFilteredBusinesses(filtered);
  }, [searchQuery, filterType, institutionType, county, businesses]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Listings</h1>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* County Filter */}
          <div>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value as CountyType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Counties</option>
              <option value="nairobi">Nairobi County</option>
              <option value="kiambu">Kiambu County</option>
            </select>
          </div>

          {/* Filter Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Businesses</option>
              <option value="public">Public Institutions</option>
              <option value="private">Private Businesses</option>
            </select>
          </div>

          {/* Institution Type Filter */}
          {filterType === 'public' && (
            <div className="md:col-span-4">
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Institutions</option>
                <option value="government">Government</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Applied Filters */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ListFilter className="h-4 w-4" />
          <span>Showing:</span>
          {county !== 'all' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full capitalize">
              {county} County
            </span>
          )}
          {filterType !== 'all' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {filterType === 'public' ? 'Public Institutions' : 'Private Businesses'}
            </span>
          )}
          {filterType === 'public' && institutionType !== 'all' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full capitalize">
              {institutionType}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
              Search: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}