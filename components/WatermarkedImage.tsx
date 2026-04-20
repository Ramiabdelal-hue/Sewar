"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * يدمج الـ logo مع الصورة مباشرة عبر Canvas
 * بحيث لا يمكن إزالة الـ watermark من الـ DOM
 */
export default function WatermarkedImage({ src, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/logo.png";

    let imgLoaded = false;
    let logoLoaded = false;

    const tryDraw = () => {
      if (!imgLoaded || !logoLoaded) return;

      // ضبط حجم الـ canvas
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // ارسم الصورة الأصلية
      ctx.drawImage(img, 0, 0);

      // احسب حجم الـ logo (50% من عرض الصورة)
      const logoW = canvas.width * 0.5;
      const logoH = (logo.naturalHeight / logo.naturalWidth) * logoW;
      const logoX = (canvas.width - logoW) / 2;
      const logoY = (canvas.height - logoH) / 2;

      // ارسم الـ logo مع rotation و opacity
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.globalCompositeOperation = "screen";
      ctx.translate(logoX + logoW / 2, logoY + logoH / 2);
      ctx.rotate(-15 * Math.PI / 180);
      ctx.drawImage(logo, -logoW / 2, -logoH / 2, logoW, logoH);
      ctx.restore();

      setLoaded(true);
    };

    img.onload = () => { imgLoaded = true; tryDraw(); };
    logo.onload = () => { logoLoaded = true; tryDraw(); };

    // fallback إذا فشل تحميل الـ logo
    img.onerror = () => {
      canvas.width = 400;
      canvas.height = 300;
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, 400, 300);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: loaded ? "block" : "none", ...style }}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
    />
  );
}
