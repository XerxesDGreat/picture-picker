import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { uploadFile } from '@/lib/minio';
import sharp from 'sharp';
import exifr from 'exifr';

const prisma = new PrismaClient();

async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  };
}

async function getImageCaptureDate(buffer: Buffer): Promise<Date | null> {
  try {
    const exif = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    if (exif) {
      // Try different EXIF date fields in order of preference
      const captureDate = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
      if (captureDate) {
        return new Date(captureDate);
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    if (album.creator.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { url, objectName } = await uploadFile(
          buffer,
          file.name,
          file.type
        );

        const dimensions = await getImageDimensions(buffer);
        const captureDate = await getImageCaptureDate(buffer);

        return prisma.photo.create({
          data: {
            title: file.name,
            url,
            objectName,
            width: dimensions.width,
            height: dimensions.height,
            captureDate,
            albumId: id,
            creatorId: album.creatorId
          }
        });
      })
    );

    return NextResponse.json({ photos: uploadedPhotos });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Error uploading photos' },
      { status: 500 }
    );
  }
} 