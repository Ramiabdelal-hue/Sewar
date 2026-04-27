import { v2 as cloudinary } from 'cloudinary';

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// التحقق من الإعدادات
const checkConfig = () => {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error('❌ إعدادات Cloudinary غير مكتملة:', {
      cloud_name: config.cloud_name ? '✓' : '✗',
      api_key: config.api_key ? '✓' : '✗',
      api_secret: config.api_secret ? '✓' : '✗',
    });
    throw new Error('Cloudinary configuration is incomplete. Check your environment variables.');
  }
  console.log('✅ إعدادات Cloudinary صحيحة:', config.cloud_name);
};

export default cloudinary;

// دالة لرفع الصورة
export async function uploadImage(file: File) {
  checkConfig();
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log('📤 رفع صورة:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'driving-app/images',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ خطأ Cloudinary:', error);
          reject(error);
        } else {
          console.log('✅ تم رفع الصورة:', result?.secure_url);
          resolve(result);
        }
      }
    ).end(buffer);
  });
}

// دالة لرفع الفيديو
export async function uploadVideo(file: File) {
  checkConfig();
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log('📤 رفع فيديو:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'driving-app/videos',
        resource_type: 'video',
      },
      (error, result) => {
        if (error) {
          console.error('❌ خطأ Cloudinary:', error);
          reject(error);
        } else {
          console.log('✅ تم رفع الفيديو:', result?.secure_url);
          resolve(result);
        }
      }
    ).end(buffer);
  });
}

// دالة لرفع الصوت
export async function uploadAudio(file: File) {
  checkConfig();
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log('📤 رفع صوت:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'driving-app/audio',
        resource_type: 'video', // Cloudinary يستخدم 'video' للصوت أيضاً
      },
      (error, result) => {
        if (error) {
          console.error('❌ خطأ Cloudinary:', error);
          reject(error);
        } else {
          console.log('✅ تم رفع الصوت:', result?.secure_url);
          resolve(result);
        }
      }
    ).end(buffer);
  });
}

// دالة لحذف ملف
export async function deleteFile(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
