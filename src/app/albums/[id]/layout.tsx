import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

interface LayoutProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumLayout({ params }: LayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      photos: {
        include: {
          votes: true,
        },
      },
      creator: true,
      sharedWith: true,
    },
  });

  if (!album) {
    redirect('/albums');
  }

  // Check if user has access to this album
  if (album.creator.id !== session.user.id && !album.sharedWith.some(user => user.id === session.user.id)) {
    redirect('/albums');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* children */}
      </div>
    </div>
  );
} 