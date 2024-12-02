import { Star, ThumbsUp, MessageCircle, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { Review } from '../types';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuthStore();
  const isOwner = user?.id === review.userId;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(review.id);
      toast.success('Review deleted successfully');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {review.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{review.user.name}</span>
              <span className="mx-2 text-gray-300">•</span>
              <time className="text-sm text-gray-500">
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </time>
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu">
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Review
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Review
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-gray-600">{review.content}</p>

      {review.photos && review.photos.length > 0 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto">
          {review.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Review photo ${index + 1}`}
              className="h-24 w-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
        <button className="flex items-center hover:text-gray-700">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
}
