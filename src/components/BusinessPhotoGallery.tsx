import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Business } from '../types';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';

interface BusinessPhotoGalleryProps {
  business: Business;
}

export function BusinessPhotoGallery({ business }: BusinessPhotoGalleryProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { handleImageUpload, isLoading } = useImageUpload();
  const [userPhotos, setUserPhotos] = useState<string[]>([]);

  const allPhotos = [...business.gallery, ...userPhotos];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      setUserPhotos([...userPhotos, imageUrl]);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex((prev) => 
        prev === 0 ? allPhotos.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) => 
        prev === allPhotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div>
      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block w-full cursor-pointer">
          <div className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Add Photos
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                Help others by sharing your photos
              </span>
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Photo Grid */}
      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allPhotos.map((photo, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImageIndex(index);
                setShowModal(true);
              }}
              className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              <img
                src={photo}
                alt={`${business.name} photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No photos available yet. Be the first to add one!
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={allPhotos[selectedImageIndex]}
              alt={`${business.name} photo ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
              <p className="text-white text-sm">
                Photo {selectedImageIndex + 1} of {allPhotos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}