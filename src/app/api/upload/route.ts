import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '@/lib/auth-guard';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Maximum accepted upload size (10 MB). */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Only raster image formats are accepted. SVG is excluded on purpose because it
 * can carry script payloads and would be served from our own domain.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/** Folders callers may write into, to prevent arbitrary Cloudinary paths. */
const ALLOWED_FOLDERS = new Set([
  'companies',
  'logos',
  'covers',
  'products',
  'reviews',
  'avatars',
]);

export async function POST(request: NextRequest) {
  try {
    // Uploads consume paid Cloudinary quota: never allow anonymous callers.
    const auth = await requireAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = (formData.get('folder') as string) || 'companies';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: 'Unsupported file type',
          allowed: Array.from(ALLOWED_MIME_TYPES),
        },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large', maxBytes: MAX_FILE_SIZE },
        { status: 413 }
      );
    }

    const folder = ALLOWED_FOLDERS.has(requestedFolder)
      ? requestedFolder
      : 'companies';

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `multi-tenant-directory/${folder}`,
            // Pinned to `image` so a disguised payload cannot be stored as a
            // different resource type.
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'No publicId provided' },
        { status: 400 }
      );
    }

    // Restrict deletions to assets this application owns.
    if (!publicId.startsWith('multi-tenant-directory/')) {
      return NextResponse.json(
        { error: 'Invalid publicId' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}

