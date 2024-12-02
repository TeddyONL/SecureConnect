import { useState } from 'react';
import { Star, Image as ImageIcon, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  onSubmit: (review: {
    rating: number;
    content: string;
    photos?: string[];
  }) => void;
  onCancel: () => void;
}

export function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { imageUrl, handleImageUpload } = useImageUpload();
  const [photos, setPhotos] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photos.length >= 5) {
        toast.error('Maximum 5 photos allowed');
        return;
      }

      try {
        await handleImageUpload(file);
        if (imageUrl) {
          setPhotos([...photos, imageUrl]);
          toast.success('Photo uploaded successfully');
        }
      } catch (error) {
        toast.error('Failed to upload photo');
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    toast.success('Photo removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, content, photos });
      toast.success('Review submitted successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Stars */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              className="p-1 focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredStar || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-red-500 text-xs">{errors.rating}</p>}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review" className="block text-sm font-medium text-gray-700">
          Your Review
        </label>
        <textarea
          id="review"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`mt-1 block w-full rounded-lg border ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          placeholder="Share your experience with this business..."
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Add Photos</label>
        <div className="mt-2 flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ImageIcon className="h-5 w-5 mr-2 text-gray-400" />
            Add Photo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={photos.length >= 5}
            />
          </label>
          <span className="text-sm text-gray-500">
            {photos.length}/5 photos
          </span>
        </div>
        {photos.length > 0 && (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
