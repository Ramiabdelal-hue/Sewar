"use client";

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WatermarkedImage({ src, className, style }: Props) {
  return (
    <div
      className={`relative select-none ${className || ""}`}
      style={{ width: "100%", height: "600px", background: "#000", ...style }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* الصورة تملأ الصندوق بدون قص */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        draggable={false}
        onContextMenu={e => e.preventDefault()}
      />

      {/* الـ watermark */}
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
          opacity: 0.25,
          mixBlendMode: "multiply",
        }}
        draggable={false}
      />
    </div>
  );
}
