import { useState, useEffect } from 'react';
import { AI } from '../lib/ai';
import { Review } from '../types';
import { Loader } from './Loader';
import { Smile, Frown, BarChart2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface AISentimentAnalysisProps {
  reviews: Review[];
}

export function AISentimentAnalysis({ reviews }: AISentimentAnalysisProps) {
  const [sentiment, setSentiment] = useState<{
    overall: number;
    aspects: { [key: string]: number };
    keywords: string[];
    summary: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeSentiment = async () => {
      try {
        const analysis = await AI.analyzeSentiment(reviews);
        setSentiment(analysis);
      } catch (error) {
        toast.error('Failed to analyze reviews');
        console.error('Sentiment analysis error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (reviews.length > 0) {
      analyzeSentiment();
    } else {
      setIsLoading(false);
    }
  }, [reviews]);

  if (isLoading) {
    return <Loader />;
  }

  if (!sentiment || reviews.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No reviews available for sentiment analysis.
      </div>
    );
  }

  const sentimentColor = sentiment.overall >= 0.6 ? 'green' : sentiment.overall >= 0.4 ? 'yellow' : 'red';
  const sentimentIcon = sentiment.overall >= 0.6 ? Smile : Frown;
  const SentimentIcon = sentimentIcon;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">AI Sentiment Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Sentiment */}
        <div className={`bg-${sentimentColor}-50 p-6 rounded-lg`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <SentimentIcon className={`h-5 w-5 text-${sentimentColor}-600 mr-2`} />
              <h4 className={`font-medium text-${sentimentColor}-900`}>Overall Sentiment</h4>
            </div>
            <span className={`text-${sentimentColor}-600 font-bold`}>
              {(sentiment.overall * 100).toFixed(1)}%
            </span>
          </div>
          <p className={`text-${sentimentColor}-800 text-sm`}>{sentiment.summary}</p>
        </div>

        {/* Aspect Analysis */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Aspect Analysis</h4>
          </div>
          <div className="space-y-3">
            {Object.entries(sentiment.aspects).map(([aspect, score]) => (
              <div key={aspect} className="flex items-center justify-between">
                <span className="text-blue-800 text-sm capitalize">{aspect}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-blue-200 rounded-full mr-2">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-blue-800 text-sm">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="md:col-span-2 bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-900">Key Themes</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {sentiment.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}