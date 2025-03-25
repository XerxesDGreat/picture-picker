import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      {
        status: 401
      }
    );
  }

  try {
    const albums = await prisma.album.findMany({
      include: {
        photos: {
          include: {
            votes: true
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      albums
    });
  } catch (error) {
    console.error('[ALBUMS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const album = await prisma.album.create({
      data: {
        title,
        description,
        creatorId: user.id
      }
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('[CREATE_ALBUM_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
} 