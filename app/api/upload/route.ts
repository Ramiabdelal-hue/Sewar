import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo, uploadAudio } from '@/lib/cloudinary';
import { checkRateLimit, getClientIp } from '@/lib/adminAuth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];

const MAX_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024,   // 5MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 10 * 1024 * 1024,  // 10MB
};

export async function POST(request: NextRequest) {
  // Rate limiting: max 20 uploads per minute per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!['image', 'video', 'audio'].includes(type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // التحقق من نوع الملف الفعلي (MIME type)
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid ${type} format` }, { status: 400 });
    }

    // التحقق من الحجم
    if (file.size > MAX_SIZES[type]) {
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZES[type] / 1024 / 1024}MB` }, { status: 400 });
    }

    let result;
    if (type === 'image') result = await uploadImage(file);
    else if (type === 'video') result = await uploadVideo(file);
    else result = await uploadAudio(file);

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
