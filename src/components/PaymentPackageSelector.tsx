import { Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PaymentPackageSelector() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            Choose a Business Package
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a subscription package to unlock premium features and maximize your business visibility.
          </p>
          <div className="mt-4">
            <Link
              to="/packages"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Available Packages
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}