"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  onSave: (editedUrl: string) => void;
  onClose: () => void;
}

interface Adjustments {
  brightness: number;  // 0-200 (100 = normal)
  contrast: number;    // 0-200
  saturation: number;  // 0-200
  rotate: number;      // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

const DEFAULT: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotate: 0,
  flipH: false,
  flipV: false,
};

export default function ImageEditor({ src, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [adj, setAdj] = useState<Adjustments>({ ...DEFAULT });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // تحميل الصورة
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => {
      // إذا فشل crossOrigin جرب بدونه
      const img2 = new Image();
      img2.onload = () => { imgRef.current = img2; setLoaded(true); };
      img2.src = src;
    };
    img.src = src;
  }, [src]);

  // رسم الصورة على الـ canvas عند كل تغيير
  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const isRotated90 = adj.rotate === 90 || adj.rotate === 270;

    canvas.width  = isRotated90 ? img.naturalHeight : img.naturalWidth;
    canvas.height = isRotated90 ? img.naturalWidth  : img.naturalHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((adj.rotate * Math.PI) / 180);
    ctx.scale(adj.flipH ? -1 : 1, adj.flipV ? -1 : 1);

    // تطبيق الفلاتر
    ctx.filter = [
      `brightness(${adj.brightness}%)`,
      `contrast(${adj.contrast}%)`,
      `saturate(${adj.saturation}%)`,
    ].join(" ");

    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [adj, loaded]);

  const handleSave = async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      // تحويل الـ canvas لـ blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob(b => b ? resolve(b) : reject(), "image/jpeg", 0.92);
      });

      // رفع الصورة المعدّلة
      const formData = new FormData();
      formData.append("file", blob, "edited.jpg");
      formData.append("type", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "" },
        body: formData,
      });

      if (!res.ok) throw new Error("فشل الرفع");
      const data = await res.json();
      onSave(data.url);
    } catch (e) {
      alert("❌ فشل حفظ الصورة: " + String(e));
    } finally {
      setSaving(false);
    }
  };

  const Slider = ({ label, key_, min = 0, max = 200, step = 1 }: {
    label: string; key_: keyof Adjustments; min?: number; max?: number; step?: number;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-gray-600">
        <span>{label}</span>
        <span className="text-blue-600">{adj[key_] as number}%</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={adj[key_] as number}
        onChange={e => setAdj(a => ({ ...a, [key_]: Number(e.target.value) }))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#003399" }}
      />
    </div>
  );

  const Btn = ({ onClick, title, children, active = false }: {
    onClick: () => void; title: string; children: React.ReactNode; active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
      style={{
        background: active ? "#003399" : "#f1f5f9",
        color: active ? "white" : "#374151",
        border: "1.5px solid " + (active ? "#003399" : "#e2e8f0"),
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: "900px", maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #0a0a2e, #003399)" }}>
          <h2 className="text-white font-black text-base">✏️ تعديل الصورة</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl font-black">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* معاينة الصورة */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-900 overflow-auto">
            {!loaded ? (
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full rounded-lg shadow-xl"
                style={{ maxHeight: "60vh" }}
              />
            )}
          </div>

          {/* أدوات التعديل */}
          <div className="w-full md:w-72 flex flex-col gap-4 p-4 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-100">

            {/* تدوير وقلب */}
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">تدوير وقلب</p>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => setAdj(a => ({ ...a, rotate: (a.rotate + 90) % 360 })) } title="تدوير يمين">
                  <span className="text-lg">↻</span>
                  <span>90°</span>
                </Btn>
                <Btn onClick={() => setAdj(a => ({ ...a, rotate: (a.rotate - 90 + 360) % 360 }))} title="تدوير يسار">
                  <span className="text-lg">↺</span>
                  <span>-90°</span>
                </Btn>
                <Btn onClick={() => setAdj(a => ({ ...a, flipH: !a.flipH }))} title="قلب أفقي" active={adj.flipH}>
                  <span className="text-lg">⇄</span>
                  <span>أفقي</span>
                </Btn>
                <Btn onClick={() => setAdj(a => ({ ...a, flipV: !a.flipV }))} title="قلب عمودي" active={adj.flipV}>
                  <span className="text-lg">⇅</span>
                  <span>عمودي</span>
                </Btn>
              </div>
            </div>

            {/* الإضاءة والألوان */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider">الإضاءة والألوان</p>
              <Slider label="☀️ السطوع" key_="brightness" />
              <Slider label="◑ التباين" key_="contrast" />
              <Slider label="🎨 التشبع" key_="saturation" />
            </div>

            {/* إعادة تعيين */}
            <button
              type="button"
              onClick={() => setAdj({ ...DEFAULT })}
              className="w-full py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
              style={{ border: "1.5px solid #e2e8f0" }}
            >
              🔄 إعادة تعيين
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all"
            style={{ border: "1.5px solid #e2e8f0" }}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !loaded}
            className="flex-1 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}
          >
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ الصورة"}
          </button>
        </div>
      </div>
    </div>
  );
}
