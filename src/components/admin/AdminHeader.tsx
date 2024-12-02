import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AdminUser } from '../../types';

export function AdminHeader() {
  const { user, logout } = useAuthStore();
  const adminUser = user as AdminUser;

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {adminUser.role === 'super_admin' ? 'Super Admin' : 'Customer Support'}
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Settings className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                <p className="text-xs text-gray-500">{adminUser.email}</p>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}