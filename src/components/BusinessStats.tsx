import { Star, Eye, Bookmark } from 'lucide-react';
import { Business } from '../types';

interface BusinessStatsProps {
  stats: Business['stats'];
}

export function BusinessStats({ stats }: BusinessStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center text-yellow-500 mb-2">
          <Star className="w-5 h-5" />
          <span className="ml-1 text-lg font-semibold">{stats.averageRating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-gray-600">{stats.totalReviews} reviews</span>
      </div>

      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center text-blue-500 mb-2">
          <Eye className="w-5 h-5" />
          <span className="ml-1 text-lg font-semibold">{stats.totalViews}</span>
        </div>
        <span className="text-sm text-gray-600">Total Views</span>
      </div>

      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center text-purple-500 mb-2">
          <Bookmark className="w-5 h-5" />
          <span className="ml-1 text-lg font-semibold">{stats.totalBookmarks}</span>
        </div>
        <span className="text-sm text-gray-600">Bookmarks</span>
      </div>
    </div>
  );
}
