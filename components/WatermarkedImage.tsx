"use client";

import { useLang } from "@/context/LangContext";

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WatermarkedImage({ src, className, style }: Props) {
  const { lang } = useLang();

  return (
    <div
      className={`relative select-none ${className || ""}`}
      style={style}
      onContextMenu={e => e.preventDefault()}
    >
      {/* الصورة الأصلية - تظهر فوراً */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="w-full h-auto block"
        draggable={false}
        onContextMenu={e => e.preventDefault()}
      />

      {/* الـ watermark كـ overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/watermark.jpeg"
        alt=""
        className="absolute inset-0 w-1/2 h-auto pointer-events-none"
        style={{
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
