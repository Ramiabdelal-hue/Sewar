import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    // تكوين Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const config = cloudinary.config();

    // التحقق من الإعدادات
    const configStatus = {
      cloud_name: config.cloud_name ? '✅ موجود' : '❌ مفقود',
      api_key: config.api_key ? '✅ موجود' : '❌ مفقود',
      api_secret: config.api_secret ? '✅ موجود' : '❌ مفقود',
    };

    // اختبار الاتصال بـ Cloudinary
    let connectionTest = 'لم يتم الاختبار';
    try {
      const result = await cloudinary.api.ping();
      connectionTest = result.status === 'ok' ? '✅ الاتصال ناجح' : '❌ فشل الاتصال';
    } catch (error: any) {
      connectionTest = `❌ خطأ: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key ? `${config.api_key.substring(0, 6)}...` : 'مفقود',
        api_secret: config.api_secret ? '***موجود***' : 'مفقود',
      },
      status: configStatus,
      connectionTest,
      environment: {
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'مفقود',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'موجود' : 'مفقود',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'موجود' : 'مفقود',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
