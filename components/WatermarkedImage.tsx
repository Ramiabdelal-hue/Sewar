"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

const footerText: Record<string, { left: string; right: string }> = {
  nl: {
    left: "© Alle rechten voorbehouden · SewarRijbewijsOnline",
    right: "🛡 Origineel educatief materiaal · Wettelijk beschermd",
  },
  fr: {
    left: "© Tous droits réservés · SewarRijbewijsOnline",
    right: "🛡 Contenu éducatif original · Protégé légalement",
  },
  ar: {
    left: "© جميع الحقوق محفوظة · SewarRijbewijsOnline",
    right: "🛡 محتوى تعليمي أصلي محمي قانونياً",
  },
  en: {
    left: "© All rights reserved · SewarRijbewijsOnline",
    right: "🛡 Original educational content · Legally protected",
  },
};

export default function WatermarkedImage({ src, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { lang } = useLang();
  const ft = footerText[lang] || footerText.nl;

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
    logo.src = "/watermark.jpeg";

    // ارسم الصورة فوراً بمجرد تحميلها بدون انتظار اللوغو
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      setLoaded(true); // أظهر الصورة فوراً

      // ثم أضف الـ watermark عند تحميل اللوغو
      logo.onload = () => {
        const logoW = canvas.width * 0.5;
        const logoH = (logo.naturalHeight / logo.naturalWidth) * logoW;
        const logoX = (canvas.width - logoW) / 2;
        const logoY = (canvas.height - logoH) / 2;

        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.globalCompositeOperation = "screen";
        ctx.translate(logoX + logoW / 2, logoY + logoH / 2);
        ctx.rotate(-15 * Math.PI / 180);
        ctx.drawImage(logo, -logoW / 2, -logoH / 2, logoW, logoH);
        ctx.restore();
      };
    };

    img.onerror = () => {
      canvas.width = 400;
      canvas.height = 300;
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, 400, 300);
    };
  }, [src]);

  return (
    <div className="relative select-none" onContextMenu={(e) => e.preventDefault()}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ display: loaded ? "block" : "none", width: "100%", ...style }}
        draggable={false}
      />
    </div>
  );
}
