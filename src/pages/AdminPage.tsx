import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminBusinessList } from '../components/admin/AdminBusinessList';
import { AdminUserList } from '../components/admin/AdminUserList';
import { AdminReportsList } from '../components/admin/AdminReportsList';
import { useAdminStore } from '../stores/adminStore';
import { Loader } from '../components/Loader';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

type AdminView = 'dashboard' | 'businesses' | 'users' | 'reports' | 'settings';

export function AdminPage() {
  const { user } = useAuthStore();
  const { fetchStats, isLoading, error } = useAdminStore();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        await fetchStats();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load admin dashboard';
        toast.error(message);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAdmin();
  }, [fetchStats]);

  // Check for valid admin roles
  if (!user || !['admin', 'super_admin', 'support'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You need admin privileges to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/profile'}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized || isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Limit access to certain features based on role
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'businesses':
        return <AdminBusinessList />;
      case 'users':
        // Only super_admin can access user management
        return user.role === 'super_admin' ? <AdminUserList /> : <Navigate to="/admin" />;
      case 'reports':
        return <AdminReportsList />;
      case 'settings':
        // Only super_admin can access settings
        return user.role === 'super_admin' ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
            {/* Add admin settings content */}
          </div>
        ) : <Navigate to="/admin" />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}