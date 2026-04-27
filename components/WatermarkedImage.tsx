"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WatermarkedImage({ src, alt = "", className, style }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // معالجة خطأ تحميل الصورة
  const handleImageError = () => {
    console.error("فشل تحميل الصورة:", src);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div
      className={`relative select-none ${className || ""}`}
      style={style}
      onContextMenu={e => e.preventDefault()}
    >
      {/* حالة التحميل */}
      {imageLoading && !imageError && (
        <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">جاري التحميل...</span>
        </div>
      )}

      {/* حالة الخطأ */}
      {imageError && (
        <div className="w-full h-48 bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center gap-2">
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-600 text-sm font-medium">فشل تحميل الصورة</span>
          <span className="text-red-400 text-xs px-4 text-center break-all">{src}</span>
        </div>
      )}

      {/* الصورة */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto block ${imageLoading || imageError ? "hidden" : ""}`}
        draggable={false}
        onContextMenu={e => e.preventDefault()}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />

      {/* علامة مائية وسط الصورة */}
      {!imageLoading && !imageError && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/watermark.jpeg"
            alt=""
            className="absolute pointer-events-none"
            style={{
              width: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-15deg)",
              opacity: 0.8,
              mixBlendMode: "multiply",
            }}
            draggable={false}
          />

          {/* زنار حقوق النشر في أسفل الصورة */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1 pointer-events-none select-none"
            style={{
              background: "linear-gradient(135deg, #0a1628 0%, #003399 100%)",
              opacity: 0.92,
            }}
          >
            <span className="text-white text-[9px] font-bold tracking-wide">
              © Alle rechten voorbehouden · SewarRijbewijsOnline
            </span>
            <span className="text-white/80 text-[9px] font-medium flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Origineel educatief materiaal · Wettelijk beschermd
            </span>
          </div>
        </>
      )}
    </div>
  );
}
