/**
 * دوال تحسين روابط Cloudinary — آمنة للاستخدام في Client Components
 * لا تحتوي على أي import من cloudinary SDK
 */

/**
 * للصور داخل الامتحانات — توفير ~50% من Bandwidth
 * q_auto:eco: ضغط عالي | f_auto: WebP/AVIF | w_900: حد أقصى | fl_immutable: cache دائم
 */
export function optimizeExamImage(url: string): string {
  if (!url) return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.includes('/upload/q_auto')) return url; // محسَّن مسبقاً
  return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_900,c_limit,fl_immutable/');
}

/**
 * للصور المصغّرة (thumbnails) — توفير ~80%
 */
export function optimizeThumbnail(url: string): string {
  if (!url) return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.includes('/upload/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto:low,f_auto,w_200,h_150,c_fill,fl_immutable/');
}
