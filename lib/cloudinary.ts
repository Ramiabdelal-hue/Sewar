/**
 * تحسين روابط Cloudinary لتوفير Bandwidth
 * يُستخدم في كل مكان تُعرض فيه صور الأسئلة
 */

/**
 * للصور داخل الامتحانات (عرض كامل، جودة جيدة)
 * توفير ~50% من الحجم مقارنة بالرابط الأصلي
 */
export function optimizeExamImage(url: string): string {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/q_auto")) return url; // محسَّن مسبقاً
  // q_auto:eco: ضغط عالي | f_auto: WebP/AVIF | w_900: حد أقصى للعرض | c_limit: لا تكبير | fl_immutable: cache دائم
  return url.replace("/upload/", "/upload/q_auto:eco,f_auto,w_900,c_limit,fl_immutable/");
}

/**
 * للصور المصغّرة (thumbnails في قائمة الأسئلة)
 * توفير ~80% من الحجم
 */
export function optimizeThumbnail(url: string): string {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/q_auto")) return url;
  return url.replace("/upload/", "/upload/q_auto:low,f_auto,w_200,h_150,c_fill,fl_immutable/");
}
