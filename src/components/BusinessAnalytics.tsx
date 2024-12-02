import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Users, Star, Eye } from 'lucide-react';
import { Business } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BusinessAnalyticsProps {
  business: Business;
}

export function BusinessAnalytics({ business }: BusinessAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Generate sample data for demonstration
  const generateData = () => {
    const today = new Date();
    let dates;
    if (timeRange === 'week') {
      dates = eachDayOfInterval({ start: subDays(today, 6), end: today });
    } else if (timeRange === 'month') {
      dates = eachDayOfInterval({ start: subDays(today, 29), end: today });
    } else {
      dates = Array.from({ length: 12 }, (_, i) => subDays(today, (11 - i) * 30));
    }

    return {
      labels: dates.map(date => 
        timeRange === 'year' 
          ? format(date, 'MMM') 
          : format(date, 'MMM d')
      ),
      views: dates.map(() => Math.floor(Math.random() * 100)),
      ratings: dates.map(() => 2 + Math.random() * 3),
      engagement: dates.map(() => Math.floor(Math.random() * 50)),
    };
  };

  const data = generateData();

  const viewsData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Views',
        data: data.views,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const ratingsData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Average Rating',
        data: data.ratings,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const engagementData = {
    labels: data.labels,
    datasets: [
      {
        label: 'User Engagement',
        data: data.engagement,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Business Analytics</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-600 mb-2">
            <Eye className="w-5 h-5 mr-2" />
            <span className="font-medium">Total Views</span>
          </div>
          <div className="text-2xl font-semibold text-blue-900">
            {business.stats?.totalViews.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center text-yellow-600 mb-2">
            <Star className="w-5 h-5 mr-2" />
            <span className="font-medium">Avg Rating</span>
          </div>
          <div className="text-2xl font-semibold text-yellow-900">
            {business.stats?.averageRating.toFixed(1)}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center text-purple-600 mb-2">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-medium">Reviews</span>
          </div>
          <div className="text-2xl font-semibold text-purple-900">
            {business.stats?.totalReviews.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-600 mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="font-medium">Growth</span>
          </div>
          <div className="text-2xl font-semibold text-green-900">
            +{Math.floor(Math.random() * 100)}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Views Trend</h4>
          <div className="h-64">
            <Line data={viewsData} options={chartOptions} />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Rating Trend</h4>
          <div className="h-64">
            <Line data={ratingsData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500">User Engagement</h4>
        <div className="h-64">
          <Bar data={engagementData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}