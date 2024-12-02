import { Bot, Search, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI Assistant',
      description: 'Get personalized recommendations and answers to your questions instantly.',
      action: {
        text: 'Try AI Assistant',
        link: '/chat'
      }
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Smart Search',
      description: 'Find exactly what you need with our intelligent search system.',
      action: {
        text: 'Start Searching',
        link: '/'
      }
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Location-Based',
      description: 'Discover businesses near you with precise location tracking.',
      action: {
        text: 'Browse Near You',
        link: '/'
      }
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Verified Reviews',
      description: 'Read and write authentic reviews from real customers.',
      action: {
        text: 'See Reviews',
        link: '/'
      }
    }
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powered by Advanced AI
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform combines cutting-edge AI technology with local business insights to provide you with the best experience.
          </p>
          <div className="mt-8">
            <Link
              to="/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              List Your Business
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <Link
                to={feature.action.link}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
              >
                {feature.action.text}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}