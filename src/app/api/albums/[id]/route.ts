import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        photos: {
          include: {
            votes: true
          },
          orderBy: [
            { captureDate: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    // Transform the response to match the client's expected structure
    return NextResponse.json({
      id: album.id,
      title: album.title,
      photos: album.photos.map(photo => ({
        id: photo.id,
        title: photo.title,
        url: photo.url,
        width: photo.width,
        height: photo.height,
        captureDate: photo.captureDate ? new Date(photo.captureDate) : null,
        createdAt: new Date(photo.createdAt),
        votes: photo.votes
      })),
      userId: album.creatorId
    });
  } catch (error) {
    console.error('[ALBUM_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
} 