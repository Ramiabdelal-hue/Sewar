// طريقة بديلة للرفع باستخدام fetch مباشرة مع Cloudinary API

export async function uploadImageDirect(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are missing');
  }

  console.log('📤 رفع صورة مباشرة إلى Cloudinary API...');

  // إنشاء timestamp و signature
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'driving-app/images';
  
  // إنشاء signature
  const crypto = require('crypto');
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  console.log('🔐 Signature created:', {
    timestamp,
    folder,
    signature: signature.substring(0, 10) + '...',
  });

  // إنشاء FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  // رفع إلى Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  console.log('📡 استجابة Cloudinary:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطأ من Cloudinary:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    
    throw new Error(errorData.error?.message || errorText || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم الرفع بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadVideoDirect(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are missing');
  }

  console.log('📤 رفع فيديو مباشرة إلى Cloudinary API...');

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'driving-app/videos';
  
  const crypto = require('crypto');
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  console.log('📡 استجابة Cloudinary:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطأ من Cloudinary:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    
    throw new Error(errorData.error?.message || errorText || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم الرفع بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadAudioDirect(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are missing');
  }

  console.log('📤 رفع صوت مباشرة إلى Cloudinary API...');

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'driving-app/audio';
  
  const crypto = require('crypto');
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  console.log('📡 استجابة Cloudinary:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ خطأ من Cloudinary:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    
    throw new Error(errorData.error?.message || errorText || 'Upload failed');
  }

  const result = await response.json();
  console.log('✅ تم الرفع بنجاح:', result.secure_url);

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}
