import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBusinessStore } from '../stores/businessStore';
import { BusinessCard } from '../components/BusinessCard';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { TestimonialSection } from '../components/TestimonialSection';
import { Footer } from '../components/Footer';
import { Business } from '../types';
import { TrendingUp, Star } from 'lucide-react';

export function HomePage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { businesses } = useBusinessStore();
  
  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchQuery(query);
  }, [location.search]);

  // Get featured businesses (top rated)
  const getFeaturedBusinesses = (): Business[] => {
    return [...businesses]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
  };

  const featuredBusinesses = getFeaturedBusinesses();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Businesses Section */}
      {featuredBusinesses.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-orange-500 fill-orange-500 mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Businesses
              </h2>
            </div>
            <p className="text-lg text-gray-600 mt-2">
              Discover our highest-rated local businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {featuredBusinesses.map((business, index) => (
              <div
                key={business.id}
                className="transform hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <BusinessCard business={business} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Categories
              </h2>
            </div>
            <p className="text-lg text-gray-600 mt-2">
              Explore businesses by category
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {['Restaurants', 'Shopping', 'Services', 'Entertainment'].map((category, index) => (
              <button
                key={category}
                onClick={() => setSearchQuery(category)}
                className="p-8 text-center rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 group"
                style={{
                  animationDelay: `${index * 150}ms`,
                  background: `var(--category-${index}-bg)`,
                }}
              >
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-gray-600 mt-2 group-hover:text-blue-500 transition-colors">
                  View All
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :root {
          --category-0-bg: linear-gradient(135deg, #e6fffa 0%, #ebf8ff 100%);
          --category-1-bg: linear-gradient(135deg, #fff5f5 0%, #fefcbf 100%);
          --category-2-bg: linear-gradient(135deg, #f0fff4 0%, #ebf8ff 100%);
          --category-3-bg: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%);
        }
      `}</style>
    </div>
  );
}