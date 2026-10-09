import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optimization
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products', // Organize in folders
          resource_type: 'auto',
          // Apply size cap on upload (from CLOUDINARY_OPTIMIZATION_GUIDE.md)
          transformation: {
            width: 2000,
            height: 2000,
            crop: 'limit',
            quality: 'auto',
          },
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = uploadResponse as any;

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}

/* ========================================
 * BACKUP: Original AWS S3 Upload Code
 * ========================================
 * Commented out during Cloudinary migration
 * Keep for 1 month as rollback option
 *
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `products/${crypto.randomUUID()}.${fileExtension}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putObjectCommand);

    const fileUrl = `${process.env.AWS_S3_URL}/${uniqueFileName}`;

    return NextResponse.json(
      {
        success: true,
        url: fileUrl,
        fileName: uniqueFileName
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to S3' },
      { status: 500 }
    );
  }
}
*/
