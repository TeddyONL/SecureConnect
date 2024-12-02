import { useState, useEffect } from 'react';
import { AI } from '../lib/ai';
import { Business } from '../types';
import { Loader } from './Loader';
import { Star, TrendingUp, AlertCircle, LightBulb } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIBusinessInsightsProps {
  business: Business;
}

export function AIBusinessInsights({ business }: AIBusinessInsightsProps) {
  const [insights, setInsights] = useState<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await AI.analyzeBusinessInsights(business);
        setInsights(data);
      } catch (error) {
        toast.error('Failed to generate business insights');
        console.error('AI insights error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [business]);

  if (isLoading) {
    return <Loader />;
  }

  if (!insights) {
    return (
      <div className="text-center text-gray-500">
        Unable to generate insights at this time.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">AI Business Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-green-900">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {insights.strengths.map((strength, index) => (
              <li key={index} className="text-green-800 text-sm">
                • {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="font-medium text-red-900">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {insights.weaknesses.map((weakness, index) => (
              <li key={index} className="text-red-800 text-sm">
                • {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Opportunities</h4>
          </div>
          <ul className="space-y-2">
            {insights.opportunities.map((opportunity, index) => (
              <li key={index} className="text-blue-800 text-sm">
                • {opportunity}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <LightBulb className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-900">AI Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="text-purple-800 text-sm">
                • {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}