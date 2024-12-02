import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function FloatingSignUpCTA() {
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useAuthStore();

  // Don't show if user is logged in or CTA was dismissed
  if (user || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm animate-fade-in">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Join Our Community
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create an account to connect with local businesses and unlock exclusive features.
          </p>
          <Link
            to="/register"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}