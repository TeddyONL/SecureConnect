import { Search, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="relative min-h-[600px] flex items-center">
      {/* Background Image - Nairobi City */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1611348524140-53c9a25263d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Nairobi City Skyline"
          className="w-full h-full object-cover"
        />
        {/* Enhanced Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI-Powered Business Discovery</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
              Discover Local Businesses
              <span className="block text-blue-400">With AI Assistance</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find, connect, and engage with local businesses in Nairobi using our advanced AI-powered platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors backdrop-blur-sm"
                >
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  List Your Business
                </Link>
              </>
            ) : (
              <Link
                to="/new"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors backdrop-blur-sm"
              >
                <Plus className="mr-2 h-5 w-5" />
                List Your Business
              </Link>
            )}
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses, categories, or ask a question..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors backdrop-blur-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
            <span>Popular:</span>
            {['Restaurants', 'Coffee Shops', 'Fitness Centers'].map((term) => (
              <button 
                key={term}
                onClick={() => setSearchQuery(term)}
                className="hover:text-blue-400 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}