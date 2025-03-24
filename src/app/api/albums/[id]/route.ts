import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;
  
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

    // Check if the user has access to this album
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (album.creatorId !== user.id) {
      // Check if the album is shared with the user
      const sharedAlbum = await prisma.album.findFirst({
        where: {
          id,
          sharedWith: {
            some: {
              id: user.id
            }
          }
        }
      });

      if (!sharedAlbum) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('[ALBUM_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
} 