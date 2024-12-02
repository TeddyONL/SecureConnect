import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Laptop,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Shirt,
  Dumbbell,
  Book,
  Palette,
  Music,
  Heart,
  Gem
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const categories: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: Laptop, color: 'blue' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'pink' },
  { id: 'home', name: 'Home & Living', icon: Home, color: 'green' },
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'red' },
  { id: 'food', name: 'Food & Beverages', icon: Utensils, color: 'orange' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, color: 'purple' },
  { id: 'books', name: 'Books & Media', icon: Book, color: 'yellow' },
  { id: 'art', name: 'Art & Crafts', icon: Palette, color: 'indigo' },
  { id: 'music', name: 'Musical Instruments', icon: Music, color: 'teal' },
  { id: 'health', name: 'Health & Beauty', icon: Heart, color: 'rose' },
  { id: 'jewelry', name: 'Jewelry', icon: Gem, color: 'amber' },
  { id: 'general', name: 'General', icon: ShoppingBag, color: 'gray' },
];

interface ProductCategoriesProps {
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function ProductCategories({ activeCategory, onSelectCategory }: ProductCategoriesProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef) {
      setShowScrollButtons(containerRef.scrollWidth > containerRef.clientWidth);
    }
  }, [containerRef]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef) return;

    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(containerRef.scrollWidth - containerRef.clientWidth, scrollPosition + scrollAmount);

    containerRef.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const getColorClass = (color: string) => ({
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    red: 'bg-red-100 text-red-600 hover:bg-red-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
    indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
    teal: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
    rose: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
    amber: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  }[color]);

  return (
    <div className="relative">
      {showScrollButtons && scrollPosition > 0 && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={setContainerRef}
        className="overflow-x-auto hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex space-x-4 py-4 px-2">
          <motion.button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              !activeCategory 
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            All Products
          </motion.button>

          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const colorClass = getColorClass(category.color);

            return (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                  isActive 
                    ? `bg-${category.color}-600 text-white`
                    : colorClass
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {showScrollButtons && containerRef && scrollPosition < (containerRef.scrollWidth - containerRef.clientWidth) && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}