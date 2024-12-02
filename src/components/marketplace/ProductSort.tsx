import { ArrowUpDown } from 'lucide-react';

type SortOption = {
  value: string;
  label: string;
};

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

interface ProductSortProps {
  currentSort: string;
  onSortChange: (value: string) => void;
}

export function ProductSort({ currentSort, onSortChange }: ProductSortProps) {
  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="form-select text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}