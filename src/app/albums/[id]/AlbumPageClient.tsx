"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import PhotoCard from "@/components/PhotoCard";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PhotoLightbox from "@/components/PhotoLightbox";

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
  captureDate: string | null;
  createdAt: string;
  votes: Array<{ id: string; value: number; userId: string }>;
}

interface Album {
  id: string;
  title: string;
  photos: Photo[];
  userId: string;
}

export default function AlbumPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("score-highest");
  const [album, setAlbum] = useState<Album | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const fetchAlbum = async () => {
        try {
          const response = await fetch(`/api/albums/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch album');
          }
          const data = await response.json();
          setAlbum(data);
        } catch (error) {
          console.error('Error fetching album:', error);
        }
      };

      fetchAlbum();
    }
  }, [id, session, status, router]);

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

      // Refresh server components
      router.refresh();

      // Refetch album data to update the client component
      const albumResponse = await fetch(`/api/albums/${id}`);
      if (albumResponse.ok) {
        const data = await albumResponse.json();
        setAlbum(data);
      }

      // Close the upload modal
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
  };

  const photoScore = (photo: Photo) => {
    return photo.votes.reduce((acc, vote) => acc + vote.value, 0);
  }

  const photoCaptureDate = (photo: Photo) => {
    return photo.captureDate ? new Date(photo.captureDate).getTime() : 0;
  }

  const handleVoteChange = async (photoId: string, value: number) => {
    if (!album || !session?.user?.id) return;

    try {
      // Update local state immediately for better UX
      setAlbum(prevAlbum => {
        if (!prevAlbum) return null;
        return {
          ...prevAlbum,
          photos: prevAlbum.photos.map(photo => {
            if (photo.id !== photoId) return photo;
            
            // Remove existing vote if any
            const votes = photo.votes.filter(vote => vote.userId !== session.user.id);
            
            // Add new vote if value is not 0
            if (value !== 0) {
              votes.push({
                id: `temp-${Date.now()}`, // Temporary ID for optimistic update
                value,
                userId: session.user.id
              });
            }
            
            return { ...photo, votes };
          })
        };
      });

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

      // Refresh the album data to get the actual vote counts
      const albumResponse = await fetch(`/api/albums/${id}`);
      if (albumResponse.ok) {
        const data = await albumResponse.json();
        setAlbum(data);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert to original state on error
      router.refresh();
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

  const scoreThenCaptureDateCmp = (a: Photo, b: Photo, reverse: boolean = false) => {
    const scoreA = photoScore(a);
    const scoreB = photoScore(b);
    if (scoreB === scoreA) {
      return photoCaptureDate(a) - photoCaptureDate(b);
    }
    return reverse ? scoreB - scoreA : scoreA - scoreB;
  }

  const sortedPhotos = [...album.photos].sort((a, b) => {
    switch (sortOption) {
      case "capture-date-oldest":
        return photoCaptureDate(a) - photoCaptureDate(b);
      case "capture-date-newest":
        return photoCaptureDate(b) - photoCaptureDate(a);
      case "date-added-oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "date-added-newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "score-highest":
        return scoreThenCaptureDateCmp(a, b, true);
      case "score-lowest":
        return scoreThenCaptureDateCmp(a, b, false);
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

        <div className="flex flex-wrap gap-2">
          {sortedPhotos.map((photo, index) => {
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
                  onVoteChange={(value: number) => handleVoteChange(photo.id, value)}
                  onClick={() => setSelectedPhotoIndex(index)}
                />
              </div>
            );
          })}
        </div>

        <PhotoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />

        {selectedPhotoIndex !== null && (
          <PhotoLightbox
            photos={sortedPhotos}
            currentPhotoIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onNavigate={setSelectedPhotoIndex}
            onVoteChange={handleVoteChange}
          />
        )}
      </div>
    </PageLayout>
  );
} 