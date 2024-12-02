import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBusinessStore } from '../stores/businessStore';
import { Navigate } from 'react-router-dom';
import { Building2, Star, Clock, Bookmark, Settings, Activity, Map } from 'lucide-react';
import { BusinessCard } from '../components/BusinessCard';
import { ReviewCard } from '../components/ReviewCard';
import { socket } from '../lib/socket';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuthStore();
  const { businesses } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'reviews' | 'bookmarks' | 'history' | 'settings'>('overview');
  const [userStats, setUserStats] = useState({
    totalBusinesses: 0,
    totalReviews: 0,
    totalBookmarks: 0,
    averageRating: 0,
  });

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    socket.emit('joinUserRoom', user.id);

    socket.on('businessUpdate', (data) => {
      // Handle real-time business updates
      toast.success(`Business ${data.name} has been ${data.action}`);
    });

    socket.on('reviewUpdate', (data) => {
      // Handle real-time review updates
      toast.success(`Review has been ${data.action}`);
    });

    return () => {
      socket.emit('leaveUserRoom', user.id);
      socket.off('businessUpdate');
      socket.off('reviewUpdate');
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userBusinesses = businesses.filter(b => b.ownerId === user.id);
  const userReviews = businesses.flatMap(b => 
    b.reviews.filter(r => r.userId === user.id)
  );
  const userBookmarks = businesses.filter(b => 
    b.stats?.totalBookmarks > 0 // This is a simplified check
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Building2}
              title="Your Businesses"
              value={userBusinesses.length}
              color="blue"
            />
            <StatCard
              icon={Star}
              title="Reviews Given"
              value={userReviews.length}
              color="yellow"
            />
            <StatCard
              icon={Bookmark}
              title="Bookmarks"
              value={userBookmarks.length}
              color="purple"
            />
            <StatCard
              icon={Activity}
              title="Avg. Rating Given"
              value={userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length || 0}
              color="green"
              isDecimal
            />
          </div>
        );

      case 'businesses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Businesses</h3>
              <button
                onClick={() => window.location.href = '/new'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add New Business
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Your Reviews</h3>
            <div className="grid gap-6">
              {userReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        );

      case 'bookmarks':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Bookmarked Businesses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBookmarks.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Recently Viewed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Implement viewed businesses history */}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-medium">Profile Settings</h3>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={user.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notification Preferences</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Push notifications</span>
                  </label>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Profile Header */}
        <div className="px-6 py-8 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'businesses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Businesses
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookmarks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookmarks
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  color: 'blue' | 'yellow' | 'purple' | 'green';
  isDecimal?: boolean;
}

function StatCard({ icon: Icon, title, value, color, isDecimal = false }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">
        {isDecimal ? value.toFixed(1) : value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{title}</p>
    </div>
  );
}