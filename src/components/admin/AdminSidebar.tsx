import { 
  Home,
  Users,
  Building2,
  AlertTriangle,
  Settings,
  BarChart2,
  Shield 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const { user } = useAuthStore();

  // Define menu items with role-based access
  const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      access: ['admin', 'super_admin', 'support']
    },
    { 
      id: 'businesses',
      name: 'Businesses',
      icon: Building2,
      access: ['admin', 'super_admin', 'support']
    },
    { 
      id: 'users',
      name: 'Users',
      icon: Users,
      access: ['super_admin']
    },
    { 
      id: 'reports',
      name: 'Reports',
      icon: AlertTriangle,
      access: ['admin', 'super_admin', 'support']
    },
    { 
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart2,
      access: ['super_admin', 'admin']
    },
    { 
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      access: ['super_admin']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.access.includes(user?.role || '')
  );

  return (
    <div className="bg-white w-64 min-h-screen shadow-sm">
      {/* Admin Info */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Version Info */}
      <div className="absolute bottom-0 w-full p-4 border-t text-xs text-gray-500">
        <div>Version 1.0.0</div>
        <div>{user?.role === 'super_admin' ? 'Super Admin Access' : user?.role === 'admin' ? 'Admin Access' : 'Support Access'}</div>
      </div>
    </div>
  );
}