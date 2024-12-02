import { useState, useEffect } from 'react';
import { useProductStore } from '../stores/productStore';
import { useBusinessStore } from '../stores/businessStore';
import { MarketplaceHeader } from '../components/marketplace/MarketplaceHeader';
import { ProductCategories } from '../components/marketplace/ProductCategories';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ProductFilters } from '../components/marketplace/ProductFilters';
import { ProductSort } from '../components/marketplace/ProductSort';
import { MarketplaceBanner } from '../components/marketplace/MarketplaceBanner';
import { SponsoredProducts } from '../components/marketplace/SponsoredProducts';
import { useLocation } from '../hooks/useLocation';
import { Product, ProductFilters as FilterType } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function MarketplacePage() {
  const { products, searchProducts, filterProducts } = useProductStore();
  const { businesses } = useBusinessStore();
  const { coordinates, requestPermission } = useLocation();
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [filters, setFilters] = useState<FilterType>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Initialize location services
  useEffect(() => {
    if (!coordinates) {
      requestPermission();
    }
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let results = products;

    // Apply category filter
    if (activeCategory) {
      results = results.filter(product => product.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Apply other filters
    results = filterProducts(filters);

    // Apply sorting
    results = sortProducts(results, currentSort);

    setFilteredProducts(results);
  }, [products, activeCategory, filters, currentSort]);

  const sortProducts = (productsToSort: Product[], sortType: string): Product[] => {
    return [...productsToSort].sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          const businessA = businesses.find(bus => bus.id === a.businessId);
          const businessB = businesses.find(bus => bus.id === b.businessId);
          return (businessB?.stats?.averageRating || 0) - (businessA?.stats?.averageRating || 0);
        case 'popularity':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    toast.success('Filters applied');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader
        view={view}
        onViewChange={setView}
        onToggleFilters={() => setShowFilters(!showFilters)}
        totalProducts={filteredProducts.length}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Banner Ads */}
        <div className="mb-8">
          <MarketplaceBanner placement="top" />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <ProductCategories
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-64 flex-shrink-0"
              >
                <ProductFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                />
                <div className="mt-6">
                  <MarketplaceBanner placement="sidebar" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Sort Controls */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {activeCategory 
                  ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Products`
                  : 'All Products'
                }
              </h2>
              <ProductSort
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />
            </div>

            {/* Sponsored Products */}
            <SponsoredProducts category={activeCategory || undefined} />

            {/* Product Grid/List */}
            {filteredProducts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-6 ${
                  view === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      business={businesses.find(b => b.id === product.businessId)}
                      view={view}
                    />
                    {/* Inline Ads */}
                    {(index + 1) % 6 === 0 && (
                      <div className="col-span-full my-6">
                        <MarketplaceBanner placement="inline" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setFilters({});
                    setActiveCategory(null);
                    setCurrentSort('relevance');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}