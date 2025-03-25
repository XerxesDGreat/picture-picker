import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Photo {
  id: string;
  url: string;
  title: string;
  votes: Array<{ id: string; value: number; userId: string }>;
}

interface PhotoLightboxProps {
  photos: Photo[];
  currentPhotoIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onVoteChange: (photoId: string, value: number) => void;
}

export default function PhotoLightbox({
  photos,
  currentPhotoIndex,
  onClose,
  onNavigate,
  onVoteChange
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentPhotoIndex];
  const hasNext = currentPhotoIndex < photos.length - 1;
  const hasPrevious = currentPhotoIndex > 0;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' && hasNext) {
      onNavigate(currentPhotoIndex + 1);
    } else if (e.key === 'ArrowLeft' && hasPrevious) {
      onNavigate(currentPhotoIndex - 1);
    }
  }, [currentPhotoIndex, hasNext, hasPrevious, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      {/* Previous button */}
      {hasPrevious && (
        <button
          onClick={() => onNavigate(currentPhotoIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50"
        >
          <ChevronLeftIcon className="h-12 w-12" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentPhotoIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50"
        >
          <ChevronRightIcon className="h-12 w-12" />
        </button>
      )}

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative max-h-[calc(100vh-8rem)] max-w-[calc(100vw-8rem)]">
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className="object-contain"
            width={1920}
            height={1080}
            priority
          />
        </div>
      </div>

      {/* Voting controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex justify-center items-center gap-4">
        <button
          onClick={() => onVoteChange(currentPhoto.id, -1)}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPhoto.votes.some(v => v.value === -1) 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          👎 ({currentPhoto.votes.filter(v => v.value === -1).length})
        </button>
        <button
          onClick={() => onVoteChange(currentPhoto.id, 1)}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPhoto.votes.some(v => v.value === 1) 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          👍 ({currentPhoto.votes.filter(v => v.value === 1).length})
        </button>
      </div>
    </div>
  );
} 