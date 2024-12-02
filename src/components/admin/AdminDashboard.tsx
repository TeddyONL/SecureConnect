import { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import {
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function AdminDashboard() {
  const { user } = useAuthStore();
  const { stats, initializeRealTimeUpdates } = useAdminStore();
  const [timeRange, setTimeRange] = useState('week');

  // Initialize real-time updates when component mounts
  useEffect(() => {
    if (user) {
      const cleanup = initializeRealTimeUpdates(user.id, user.role);
      return () => cleanup();
    }
  }, [user]);

  // Fetch initial stats using React Query
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats(),
    onError: (error) => {
      toast.error('Failed to fetch admin statistics');
    }
  });

  // Fetch activity data using React Query
  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ['adminActivity', timeRange],
    queryFn: () => adminApi.getActivityLogs({ timeRange }),
    onError: (error) => {
      toast.error('Failed to fetch activity data');
    }
  });

  // User Activity Chart Data
  const userActivityData = {
    labels: activityData?.labels || [],
    datasets: [
      {
        label: 'User Activity',
        data: activityData?.userActivity || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Business Distribution Chart Data
  const businessDistributionData = {
    labels: statsData?.businessCategories?.map(cat => cat.name) || [],
    datasets: [
      {
        data: statsData?.businessCategories?.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (isStatsLoading || isActivityLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={statsData?.userGrowth || '+0%'}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Businesses"
          value={stats.totalBusinesses}
          change={statsData?.businessGrowth || '+0%'}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          change={statsData?.reportChange || '0%'}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Verified Businesses"
          value={stats.verifiedBusinesses}
          change={statsData?.verificationGrowth || '+0%'}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={userActivityData} options={chartOptions} />
          </div>
        </div>

        {/* Business Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Business Categories
          </h3>
          <div className="h-80">
            <Pie data={businessDistributionData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activityData?.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-sm ${activity.statusColor}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-sm font-medium ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{title}</p>
    </div>
  );
}