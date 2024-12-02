import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Building2, Home, Menu, X, User, Bell } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { FloatingChat } from './FloatingChat';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-white/0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary-600">
                  iHubBiz
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                to="/listings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Building2 className="h-4 w-4 mr-1" />
                Listings
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 hover:bg-gray-100 rounded-full relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 transform ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out`}
          style={{ top: '4rem' }}
        >
          <div className="bg-white h-full shadow-xl">
            <div className="pt-4 pb-3 px-4 space-y-6">
              {user ? (
                <div className="flex items-center space-x-3 px-4 py-2 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-1 px-2">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-100"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Home
                </Link>
                <Link
                  to="/listings"
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-100"
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Listings
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-100"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
              </div>

              {!user ? (
                <div className="px-4 py-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-center font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow mt-16">
        <Outlet />
      </main>

      <Footer />
      <FloatingChat />
    </div>
  );
}