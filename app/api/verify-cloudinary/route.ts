import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };

  // التحقق من وجود المتغيرات
  const missing = [];
  if (!env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  if (!env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

  // اختبار مباشر مع Cloudinary API
  let apiTest = null;
  if (missing.length === 0) {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const crypto = require('crypto');
      
      // إنشاء signature للتحقق من صحة الـ credentials
      const stringToSign = `timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      // اختبار بسيط: طلب معلومات الـ account
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/image`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`).toString('base64')}`
          }
        }
      );

      apiTest = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      };

      if (!response.ok) {
        const errorText = await response.text();
        apiTest.error = errorText;
      }
    } catch (error: any) {
      apiTest = {
        error: error.message,
        stack: error.stack,
      };
    }
  }

  return NextResponse.json({
    environment: {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '❌ مفقود',
      CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY ? `${env.CLOUDINARY_API_KEY.substring(0, 6)}...${env.CLOUDINARY_API_KEY.substring(env.CLOUDINARY_API_KEY.length - 4)}` : '❌ مفقود',
      CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET ? `${env.CLOUDINARY_API_SECRET.substring(0, 4)}...${env.CLOUDINARY_API_SECRET.substring(env.CLOUDINARY_API_SECRET.length - 4)}` : '❌ مفقود',
    },
    missing: missing.length > 0 ? missing : null,
    apiTest,
    recommendation: missing.length > 0 
      ? 'أضف المتغيرات المفقودة في Vercel Environment Variables'
      : apiTest?.ok 
        ? '✅ الإعدادات صحيحة والاتصال ناجح'
        : '❌ الإعدادات موجودة لكن Cloudinary يرفض المصادقة - تحقق من صحة API Key و Secret',
  });
}
