'use client';

import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import { useEffect, useState } from 'react';
import CreateAlbumModal from '@/components/CreateAlbumModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Album {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  photos: {
    id: string;
    url: string;
    title: string | null;
    votes: {
      value: number;
    }[];
  }[];
}

interface AlbumsResponse {
  albums: Album[];
}

export default function AlbumsPage() {
  const { data: session } = useSession();
  const [albums, setAlbums] = useState<AlbumsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      const data = await response.json();
      setAlbums(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAlbums();
    }
  }, [session]);

  const handleCreateAlbum = async (title: string, description: string) => {
    const response = await fetch('/api/albums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create album');
    }

    const newAlbum = await response.json();
    router.push(`/albums/${newAlbum.id}`);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading albums...</div>
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

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Photo Albums</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Album
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums?.albums.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-gray-500 text-center py-8">
                No albums yet
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Album
              </button>
            </div>
          ) : (
            albums?.albums.map((album) => (
              <div key={album.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-2">{album.title}</h3>
                {album.description && (
                  <p className="text-gray-600 mb-2">{album.description}</p>
                )}
                <div className="text-sm text-gray-500 mb-4">
                  {album.photos.length} photos
                </div>
                <Link
                  href={`/albums/${album.id}`}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  View Album
                </Link>
              </div>
            ))
          )}
        </div>

        <CreateAlbumModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateAlbum={handleCreateAlbum}
        />
      </div>
    </PageLayout>
  );
} 