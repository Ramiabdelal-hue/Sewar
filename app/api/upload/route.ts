import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo, uploadAudio } from '@/lib/cloudinary';
import { uploadImageUnsigned, uploadVideoUnsigned, uploadAudioUnsigned } from '@/lib/cloudinary-unsigned';
import { checkRateLimit, getClientIp } from '@/lib/adminAuth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];

const MAX_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024,   // 5MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 10 * 1024 * 1024,  // 10MB
};

// استخدام Unsigned Upload كحل بديل
const USE_UNSIGNED_UPLOAD = true;

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

    console.log('📥 طلب رفع ملف:', { fileName: file?.name, type, size: file?.size });

    if (!file) {
      console.error('❌ لم يتم إرسال ملف');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!['image', 'video', 'audio'].includes(type)) {
      console.error('❌ نوع ملف غير صحيح:', type);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // التحقق من نوع الملف الفعلي (MIME type)
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_AUDIO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ صيغة ملف غير مدعومة:', file.type, 'المسموح:', allowedTypes);
      return NextResponse.json({ error: `Invalid ${type} format: ${file.type}` }, { status: 400 });
    }

    // التحقق من الحجم
    if (file.size > MAX_SIZES[type]) {
      console.error('❌ حجم الملف كبير جداً:', file.size, 'الحد الأقصى:', MAX_SIZES[type]);
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZES[type] / 1024 / 1024}MB` }, { status: 400 });
    }

    console.log(`🔄 بدء رفع الملف إلى Cloudinary... (${USE_UNSIGNED_UPLOAD ? 'Unsigned' : 'Signed'})`);
    
    let result;
    
    if (USE_UNSIGNED_UPLOAD) {
      // استخدام Unsigned Upload (لا يحتاج API Secret)
      try {
        if (type === 'image') result = await uploadImageUnsigned(file);
        else if (type === 'video') result = await uploadVideoUnsigned(file);
        else result = await uploadAudioUnsigned(file);
      } catch (unsignedError: any) {
        console.error('❌ فشل Unsigned Upload، محاولة Signed Upload...', unsignedError.message);
        // إذا فشل Unsigned، جرب Signed
        if (type === 'image') result = await uploadImage(file);
        else if (type === 'video') result = await uploadVideo(file);
        else result = await uploadAudio(file);
      }
    } else {
      // استخدام Signed Upload (الطريقة القديمة)
      if (type === 'image') result = await uploadImage(file);
      else if (type === 'video') result = await uploadVideo(file);
      else result = await uploadAudio(file);
    }

    console.log('✅ تم الرفع بنجاح:', (result as any).secure_url);

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error),
      hint: 'تأكد من إنشاء Upload Preset بإسم "sewar_unsigned" في Cloudinary Dashboard مع Signing Mode: Unsigned'
    }, { status: 500 });
  }
}
