"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean; // للصور المهمة التي تظهر فوق الطية
}

/**
 * يحوّل رابط Cloudinary ليستخدم:
 * - f_auto: أفضل format (webp/avif)
 * - q_auto: ضغط تلقائي
 * - w_1200: عرض مناسب
 * - c_limit: لا يكبّر الصورة
 * هذا يجعل Cloudinary CDN يـ cache الصورة بـ URL ثابت
 */
function optimizeCloudinaryUrl(url: string): string {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  // إذا فيه transformations بالفعل لا نضيف مرة ثانية
  if (url.includes("/upload/f_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200,c_limit/");
}

export default function WatermarkedImage({ src, alt = "", className, style, priority = false }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const optimizedSrc = optimizeCloudinaryUrl(src);

  return (
    <div
      className={`relative select-none ${className || ""}`}
      style={{ ...style, display: "flex", flexDirection: "column" }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* حالة التحميل */}
      {imageLoading && !imageError && (
        <div className="w-full bg-gray-100 animate-pulse flex items-center justify-center rounded flex-1" style={{ minHeight: "120px" }}>
          <svg className="w-8 h-8 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}

      {/* حالة الخطأ */}
      {imageError && (
        <div className="w-full bg-gray-100 flex flex-col items-center justify-center gap-2 rounded flex-1" style={{ minHeight: "120px" }}>
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-400 text-xs">لا يمكن تحميل الصورة</span>
        </div>
      )}

      {/* الصورة الرئيسية */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimizedSrc}
        alt={alt}
        // lazy loading للصور خارج الشاشة — يقلل الطلبات الأولية
        loading={priority ? "eager" : "lazy"}
        // async decoding لا يعطل الـ main thread
        decoding="async"
        // fetchpriority للصور المهمة
        {...(priority ? { fetchPriority: "high" } : {})}
        className={`block ${imageLoading || imageError ? "hidden" : ""}`}
        style={{
          width: "100%",
          flex: 1,
          objectFit: "cover",
          objectPosition: "center",
          minHeight: 0,
        }}
        draggable={false}
        onContextMenu={e => e.preventDefault()}
        onError={() => { setImageError(true); setImageLoading(false); }}
        onLoad={() => setImageLoading(false)}
      />

      {/* علامة مائية نصية فقط */}
          {!imageLoading && !imageError && (
        <>
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1 pointer-events-none select-none"
            style={{
              background: "linear-gradient(135deg, #0a1628 0%, #003399 100%)",
              opacity: 0.92,
            }}
          >
            <span className="text-white text-[9px] font-bold tracking-wide">
              © Alle rechten voorbehouden · Sewar Rijbewijs Online
            </span>
            <span className="text-white/80 text-[9px] font-medium flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Wettelijk beschermd
            </span>
          </div>
        </>
      )}
    </div>
  );
}
