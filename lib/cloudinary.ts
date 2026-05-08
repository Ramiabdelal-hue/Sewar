import { v2 as cloudinary } from 'cloudinary';

// ─── إعداد Cloudinary ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── دوال الرفع (Upload) ──────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<{ secure_url: string; public_id: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'driving-app/images', resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    ).end(buffer);
  });
}

export async function uploadVideo(file: File): Promise<{ secure_url: string; public_id: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'driving-app/videos', resource_type: 'video' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    ).end(buffer);
  });
}

export async function uploadAudio(file: File): Promise<{ secure_url: string; public_id: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'driving-app/audio', resource_type: 'video' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    ).end(buffer);
  });
}

// ─── دوال الرفع فقط — server-only ────────────────────────────────────────────
// لدوال تحسين الروابط استخدم: @/lib/cloudinary-utils
