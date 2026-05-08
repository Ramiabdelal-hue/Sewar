/**
 * دوال تحسين روابط Cloudinary — آمنة للاستخدام في Client Components
 * لا تحتوي على أي import من cloudinary SDK
 */

/**
 * للصور داخل الامتحانات — توفير ~50% من Bandwidth
 * q_auto:good: ضغط جيد | f_auto: WebP/AVIF تلقائياً | w_900: حد أقصى للعرض
 * Cloudinary يعمل بـ CDN cache تلقائياً بدون أي flag إضافي
 */
export function optimizeExamImage(url: string): string {
  if (!url) return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.includes('/upload/q_auto') || url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto:good,f_auto,w_900,c_limit/');
}

/**
 * للصور المصغّرة (thumbnails) — توفير ~80%
 */
export function optimizeThumbnail(url: string): string {
  if (!url) return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.includes('/upload/q_auto') || url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto:low,f_auto,w_200,h_150,c_fill/');
}
