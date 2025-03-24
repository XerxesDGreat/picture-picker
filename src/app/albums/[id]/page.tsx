'use client';

import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { use } from 'react';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import PhotoCard from '@/components/PhotoCard';

interface Vote {
  id: string;
  value: number;
  userId: string;
}

interface Photo {
  id: string;
  url: string;
  title: string | null;
  votes: Vote[];
  width: number;
  height: number;
  captureDate: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

interface Album {
  id: string;
  title: string;
  description: string | null;
  photos: Photo[];
  creator: {
    id: string;
    name: string | null;
  };
}

type SortOption = 
  | 'captureDate-asc'
  | 'captureDate-desc'
  | 'createdAt-asc'
  | 'createdAt-desc'
  | 'score-desc'
  | 'score-asc';

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('score-desc');

  const sortedPhotos = useMemo(() => {
    if (!album?.photos) return [];
    
    return [...album.photos].sort((a, b) => {
      const getScore = (photo: any) => {
        return photo.votes.reduce((sum: number, vote: any) => sum + vote.value, 0);
      };

      switch (sortOption) {
        case 'captureDate-asc':
          return new Date(a.captureDate).getTime() - new Date(b.captureDate).getTime();
        case 'captureDate-desc':
          return new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime();
        case 'createdAt-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdAt-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'score-asc': {
          const scoreDiff = getScore(a) - getScore(b);
          return scoreDiff !== 0 ? scoreDiff : new Date(a.captureDate).getTime() - new Date(b.captureDate).getTime();
        }
        case 'score-desc': {
          const scoreDiff = getScore(b) - getScore(a);
          return scoreDiff !== 0 ? scoreDiff : new Date(a.captureDate).getTime() - new Date(b.captureDate).getTime();
        }
        default:
          return 0;
      }
    });
  }, [album?.photos, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  const fetchAlbum = async () => {
    try {
      const response = await fetch(`/api/albums/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch album');
      }
      const data = await response.json();
      setAlbum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/?signedOut=true';
      return;
    }
    
    if (status === 'authenticated' && id) {
      fetchAlbum();
    }
  }, [status, id]);

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`/api/albums/${id}/photos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload photos');
    }

    await fetchAlbum();
  };

  const handleVote = async (photoId: string, value: number) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Fetch updated album data to get new vote counts
      await fetchAlbum();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading album...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </PageLayout>
    );
  }

  if (!album) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Album not found</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button, album info, and controls */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link
              href="/albums"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 block mb-4"
            >
              ← Back to Albums
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{album.title}</h1>
            {album.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{album.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="captureDate-asc">Capture date (old to new)</option>
              <option value="captureDate-desc">Capture date (new to old)</option>
              <option value="createdAt-asc">Date added (old to new)</option>
              <option value="createdAt-desc">Date added (new to old)</option>
              <option value="score-desc">Score (high to low)</option>
              <option value="score-asc">Score (low to high)</option>
            </select>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Photos
            </button>
          </div>
        </div>

        {/* Photo display */}
        {album.photos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No photos in this album yet</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Photos
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedPhotos.map((photo) => {
              const aspectRatio = photo.width / photo.height;
              const isPortrait = photo.height > photo.width;
              
              return (
                <div 
                  key={photo.id}
                  className="flex-grow"
                  style={{
                    height: '375px',
                    flexBasis: isPortrait ? '250px' : `${Math.floor(aspectRatio * 375)}px`,
                    flexGrow: isPortrait ? 0 : 1,
                    minWidth: isPortrait ? '250px' : '300px',
                    maxWidth: isPortrait ? '250px' : '600px'
                  }}
                >
                  <PhotoCard
                    key={photo.id}
                    id={photo.id}
                    url={photo.url}
                    title={photo.title}
                    votes={photo.votes}
                    onVoteChange={(value: number) => handleVote(photo.id, value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        <PhotoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
          albumId={id}
        />
      </div>
    </PageLayout>
  );
} 