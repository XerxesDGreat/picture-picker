import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/minio";
import sharp from 'sharp';
import exifr from 'exifr';

async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

async function getCaptureDate(buffer: Buffer): Promise<Date | null> {
  try {
    const exif = await exifr.parse(buffer);
    return exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal) : null;
  } catch (error) {
    console.error('Error parsing EXIF:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        creator: true,
        sharedWith: true,
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this album
    if (
      album.creator.id !== session.user.id &&
      !album.sharedWith.some((user) => user.id === session.user.id)
    ) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
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
        const captureDate = await getCaptureDate(buffer);

        return prisma.photo.create({
          data: {
            title: file.name,
            url,
            objectName,
            width: dimensions.width,
            height: dimensions.height,
            captureDate,
            albumId: album.id,
            creatorId: album.creator.id
          },
        });
      })
    );

    return NextResponse.json(uploadedPhotos);
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
} 