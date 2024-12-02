import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductFilters as FilterType } from '../../types';

interface ProductFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Automotive',
  'Books',
  'Others'
];

const PRICE_RANGES = [
  { label: 'Under KES 1,000', min: 0, max: 1000 },
  { label: 'KES 1,000 - 5,000', min: 1000, max: 5000 },
  { label: 'KES 5,000 - 20,000', min: 5000, max: 20000 },
  { label: 'KES 20,000 - 50,000', min: 20000, max: 50000 },
  { label: 'Over KES 50,000', min: 50000, max: Infinity }
];

export function ProductFilters({ filters, onChange, onClose }: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (updates: Partial<FilterType>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Filters</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Categories</h4>
        <div className="space-y-2">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.category === category}
                onChange={() => handleChange({ category })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <label key={range.label} className="flex items-center">
              <input
                type="radio"
                checked={
                  localFilters.priceRange?.min === range.min &&
                  localFilters.priceRange?.max === range.max
                }
                onChange={() => handleChange({ priceRange: { min: range.min, max: range.max } })}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Availability</h4>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={localFilters.inStock}
            onChange={(e) => handleChange({ inStock: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-600">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        Clear All Filters
      </button>
    </div>
  );
}