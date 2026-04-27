import { NextResponse } from 'next/server';

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return NextResponse.json({
      success: false,
      error: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing',
    });
  }

  // اختبار Unsigned Upload مباشرة
  const testUpload = async () => {
    try {
      // إنشاء صورة اختبار صغيرة (1x1 pixel)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const formData = new FormData();
      formData.append('file', testImageBase64);
      formData.append('upload_preset', 'sewar_unsigned');

      console.log('🧪 اختبار Unsigned Upload...');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('📡 استجابة Cloudinary:', response.status, response.statusText);

      const data = await response.json();

      if (response.ok) {
        console.log('✅ نجح الاختبار!');
        return {
          success: true,
          message: '✅ Upload Preset يعمل بشكل صحيح!',
          result: {
            url: data.secure_url,
            public_id: data.public_id,
          },
        };
      } else {
        console.error('❌ فشل الاختبار:', data);
        return {
          success: false,
          error: data.error?.message || 'Upload failed',
          details: data,
        };
      }
    } catch (error: any) {
      console.error('❌ خطأ في الاختبار:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const result = await testUpload();

  return NextResponse.json({
    cloudName,
    uploadPreset: 'sewar_unsigned',
    ...result,
    instructions: result.success
      ? 'Upload Preset يعمل! يمكنك الآن رفع الصور.'
      : 'Upload Preset غير موجود أو غير صحيح. تأكد من إنشائه في Cloudinary Dashboard.',
  });
}
