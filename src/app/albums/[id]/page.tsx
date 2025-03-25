import AlbumPageClient from './AlbumPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="w-full">
      <AlbumPageClient id={id} />
    </div>
  );
} 