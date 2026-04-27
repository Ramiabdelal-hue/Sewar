import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    // تكوين Cloudinary
    const config = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    console.log('🔧 تكوين Cloudinary:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? `${config.api_key.substring(0, 6)}...` : 'مفقود',
      api_secret: config.api_secret ? `${config.api_secret.substring(0, 4)}...` : 'مفقود',
    });

    cloudinary.config(config);

    // إنشاء صورة اختبار صغيرة (1x1 pixel)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.log('📤 محاولة رفع صورة اختبار...');

    // محاولة الرفع
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        testImageBase64,
        {
          folder: 'driving-app/test',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('❌ خطأ Cloudinary:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              error: error,
            });
            reject(error);
          } else {
            console.log('✅ نجح الرفع:', result?.secure_url);
            resolve(result);
          }
        }
      );
    });

    return NextResponse.json({
      success: true,
      message: '✅ الرفع نجح! API credentials صحيحة',
      result: {
        url: (result as any).secure_url,
        public_id: (result as any).public_id,
      },
      config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key ? `${config.api_key.substring(0, 6)}...${config.api_key.substring(config.api_key.length - 4)}` : 'مفقود',
        api_secret: config.api_secret ? 'موجود' : 'مفقود',
      }
    });

  } catch (error: any) {
    console.error('❌ فشل الاختبار:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      http_code: error.http_code,
      details: {
        name: error.name,
        message: error.message,
        http_code: error.http_code,
      },
      config: {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'مفقود',
        api_key: process.env.CLOUDINARY_API_KEY ? 'موجود' : 'مفقود',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'موجود' : 'مفقود',
      },
      recommendation: error.http_code === 401 
        ? 'API Key أو API Secret خاطئ. تحقق من Cloudinary Dashboard وتأكد من نسخ القيم بشكل صحيح.'
        : error.http_code === 403
        ? 'ليس لديك صلاحية. تحقق من Cloudinary Account settings.'
        : 'خطأ غير متوقع. تحقق من Cloudinary Dashboard.',
    }, { status: 500 });
  }
}
