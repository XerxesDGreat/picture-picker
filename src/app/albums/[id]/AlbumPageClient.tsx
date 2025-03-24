"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import PhotoCard from "@/components/PhotoCard";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type SortOption = 
  | "capture-date-oldest"
  | "capture-date-newest"
  | "date-added-oldest"
  | "date-added-newest"
  | "score-highest"
  | "score-lowest";

interface Photo {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  captureDate: Date | null;
  createdAt: Date;
  votes: Array<{ id: string; value: number; userId: string }>;
}

interface Album {
  id: string;
  title: string;
  photos: Photo[];
  userId: string;
  sharedWith: string[];
}

export default function AlbumPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("capture-date-newest");
  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const fetchAlbum = async () => {
      try {
        const response = await fetch(`/api/albums/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch album');
        }
        const data = await response.json();
        
        // Check if user has access to this album
        if (data.userId !== session.user.id && !data.sharedWith.includes(session.user.id)) {
          router.push('/albums');
          return;
        }
        
        setAlbum(data);
      } catch (error) {
        console.error('Error fetching album:', error);
      }
    };

    fetchAlbum();
  }, [id, session, router]);

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`/api/albums/${id}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }

      router.refresh();
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
  };

  const handleVoteChange = async (photoId: string, value: number) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vote');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  if (!album) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading album...</div>
        </div>
      </PageLayout>
    );
  }

  const sortedPhotos = [...album.photos].sort((a, b) => {
    switch (sortOption) {
      case "capture-date-oldest":
        return (a.captureDate?.getTime() ?? 0) - (b.captureDate?.getTime() ?? 0);
      case "capture-date-newest":
        return (b.captureDate?.getTime() ?? 0) - (a.captureDate?.getTime() ?? 0);
      case "date-added-oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "date-added-newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "score-highest":
        return b.votes.length - a.votes.length;
      case "score-lowest":
        return a.votes.length - b.votes.length;
      default:
        return 0;
    }
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{album.title}</h1>
          <div className="flex gap-4">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="capture-date-oldest">Capture date (old to new)</option>
              <option value="capture-date-newest">Capture date (new to old)</option>
              <option value="date-added-oldest">Date added (old to new)</option>
              <option value="date-added-newest">Date added (new to old)</option>
              <option value="score-highest">Score (high to low)</option>
              <option value="score-lowest">Score (low to high)</option>
            </select>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Photos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              url={photo.url}
              title={photo.title}
              votes={photo.votes}
              onVoteChange={(value: number) => handleVoteChange(photo.id, value)}
            />
          ))}
        </div>

        <PhotoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      </div>
    </PageLayout>
  );
} 