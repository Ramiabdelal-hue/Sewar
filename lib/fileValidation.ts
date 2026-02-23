// File validation utilities

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg'
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateVideo(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'لم يتم تحديد ملف' };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return { 
      valid: false, 
      error: `حجم الفيديو كبير جداً. الحد الأقصى ${MAX_VIDEO_SIZE / 1024 / 1024}MB` 
    };
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'نوع الفيديو غير مدعوم. استخدم MP4, WebM, أو OGG' 
    };
  }

  return { valid: true };
}

export function validateAudio(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'لم يتم تحديد ملف' };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { 
      valid: false, 
      error: `حجم الملف الصوتي كبير جداً. الحد الأقصى ${MAX_AUDIO_SIZE / 1024 / 1024}MB` 
    };
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'نوع الملف الصوتي غير مدعوم. استخدم MP3, WAV, أو OGG' 
    };
  }

  return { valid: true };
}

export function validateImage(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'لم يتم تحديد ملف' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { 
      valid: false, 
      error: `حجم الصورة كبير جداً. الحد الأقصى ${MAX_IMAGE_SIZE / 1024 / 1024}MB` 
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'نوع الصورة غير مدعوم. استخدم JPG, PNG, GIF, أو WebP' 
    };
  }

  return { valid: true };
}

// Sanitize filename to prevent path traversal attacks
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 255); // Limit length
}
