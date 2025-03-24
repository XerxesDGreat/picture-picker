import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { value } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { votes: true }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        photoId: id,
        userId: user.id
      }
    });

    if (existingVote) {
      if (value === 0) {
        // If value is 0, we're unvoting - delete the vote
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
      } else {
        // Update the existing vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });
      }
    } else if (value !== 0) {
      // Only create a new vote if we're not unvoting
      await prisma.vote.create({
        data: {
          value,
          photoId: id,
          userId: user.id
        }
      });
    }

    // Get updated photo with votes
    const updatedPhoto = await prisma.photo.findUnique({
      where: { id },
      include: { votes: true }
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
} 