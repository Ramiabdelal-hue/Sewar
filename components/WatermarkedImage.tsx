"use client";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WatermarkedImage({ src, alt = "", className, style }: Props) {
  return (
    <div
      className={`relative select-none ${className || ""}`}
      style={style}
      onContextMenu={e => e.preventDefault()}
    >
      {/* الصورة */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto block"
        draggable={false}
        onContextMenu={e => e.preventDefault()}
      />

      {/* علامة مائية وسط الصورة */}
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
    </div>
  );
}
