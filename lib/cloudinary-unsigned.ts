// حل بديل: رفع بدون مصادقة (Unsigned Upload)
// يتطلب إنشاء Upload Preset في Cloudinary Dashboard

export async function uploadImageUnsigned(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = 'sewar_unsigned'; // يجب إنشاؤه في Cloudinary Dashboard

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  console.log('📤 رفع صورة بدون مصادقة (Unsigned):', file.name);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'driving-app/images');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ خطأ في رفع الصورة:', error);
    throw new Error(error.error?.message || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم رفع الصورة بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadVideoUnsigned(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = 'sewar_unsigned';

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  console.log('📤 رفع فيديو بدون مصادقة (Unsigned):', file.name);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'driving-app/videos');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ خطأ في رفع الفيديو:', error);
    throw new Error(error.error?.message || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم رفع الفيديو بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadAudioUnsigned(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = 'sewar_unsigned';

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  console.log('📤 رفع صوت بدون مصادقة (Unsigned):', file.name);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'driving-app/audio');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ خطأ في رفع الصوت:', error);
    throw new Error(error.error?.message || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم رفع الصوت بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}
