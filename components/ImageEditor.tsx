"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  src: string;
  onSave: (editedUrl: string) => void;
  onClose: () => void;
}

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  scale: number; // 10–300%
}

interface TextLayer {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  bg: string; // background color or "transparent"
  dragging: boolean;
}

const DEFAULT_ADJ: Adjustments = {
  brightness: 100, contrast: 100, saturation: 100,
  rotate: 0, flipH: false, flipV: false, scale: 100,
};

const COLORS = ["#ffffff","#000000","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#ffcc00"];

export default function ImageEditor({ src, onSave, onClose }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const imgRef      = useRef<HTMLImageElement | null>(null);
  const [adj, setAdj]         = useState<Adjustments>({ ...DEFAULT_ADJ });
  const [texts, setTexts]     = useState<TextLayer[]>([]);
  const [activeTab, setActiveTab] = useState<"adjust" | "resize" | "text">("adjust");
  const [saving, setSaving]   = useState(false);
  const [loaded, setLoaded]   = useState(false);

  // new text form
  const [newText, setNewText]       = useState("اكتب هنا");
  const [newFontSize, setNewFontSize] = useState(28);
  const [newColor, setNewColor]     = useState("#ffffff");
  const [newBold, setNewBold]       = useState(true);
  const [newItalic, setNewItalic]   = useState(false);
  const [newBg, setNewBg]           = useState("transparent");

  // drag state
  const dragRef = useRef<{ id: number; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // ── load image ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { imgRef.current = img; setLoaded(true); };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => { imgRef.current = img2; setLoaded(true); };
      img2.src = src;
    };
    img.src = src;
  }, [src]);

  // ── draw canvas ─────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;

    const img      = imgRef.current;
    const scaleFactor = adj.scale / 100;
    const isRotated90 = adj.rotate === 90 || adj.rotate === 270;

    const baseW = Math.round(img.naturalWidth  * scaleFactor);
    const baseH = Math.round(img.naturalHeight * scaleFactor);

    canvas.width  = isRotated90 ? baseH : baseW;
    canvas.height = isRotated90 ? baseW : baseH;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((adj.rotate * Math.PI) / 180);
    ctx.scale(adj.flipH ? -1 : 1, adj.flipV ? -1 : 1);
    ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
    ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    // رسم طبقات النص
    texts.forEach(t => {
      ctx.save();
      ctx.font = `${t.italic ? "italic " : ""}${t.bold ? "bold " : ""}${t.fontSize}px Arial, sans-serif`;
      const metrics = ctx.measureText(t.text);
      const tw = metrics.width;
      const th = t.fontSize * 1.3;

      if (t.bg !== "transparent") {
        ctx.fillStyle = t.bg;
        ctx.fillRect(t.x - 4, t.y - th + 4, tw + 8, th + 4);
      }
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }, [adj, texts, loaded]);

  useEffect(() => { draw(); }, [draw]);

  // ── drag text ────────────────────────────────────────────────────────────────
  const getCanvasPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width  / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      ctx.font = `${t.italic ? "italic " : ""}${t.bold ? "bold " : ""}${t.fontSize}px Arial`;
      const tw = ctx.measureText(t.text).width;
      const th = t.fontSize * 1.3;
      if (pos.x >= t.x - 4 && pos.x <= t.x + tw + 4 && pos.y >= t.y - th + 4 && pos.y <= t.y + 8) {
        dragRef.current = { id: t.id, startX: e.clientX, startY: e.clientY, origX: t.x, origY: t.y };
        return;
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width  / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const dx = (e.clientX - dragRef.current.startX) * scaleX;
    const dy = (e.clientY - dragRef.current.startY) * scaleY;
    setTexts(prev => prev.map(t =>
      t.id === dragRef.current!.id
        ? { ...t, x: dragRef.current!.origX + dx, y: dragRef.current!.origY + dy }
        : t
    ));
  };

  const onMouseUp = () => { dragRef.current = null; };

  // ── add text ─────────────────────────────────────────────────────────────────
  const addText = () => {
    if (!newText.trim() || !canvasRef.current) return;
    const cx = canvasRef.current.width  / 2;
    const cy = canvasRef.current.height / 2;
    setTexts(prev => [...prev, {
      id: Date.now(), text: newText, x: cx - 60, y: cy,
      fontSize: newFontSize, color: newColor,
      bold: newBold, italic: newItalic, bg: newBg, dragging: false,
    }]);
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob>((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(), "image/jpeg", 0.92)
      );
      const fd = new FormData();
      fd.append("file", blob, "edited.jpg");
      fd.append("type", "image");
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "" },
        body: fd,
      });
      if (!r.ok) throw new Error("فشل الرفع");
      const d = await r.json();
      onSave(d.url);
    } catch (e) {
      alert("❌ " + String(e));
    } finally {
      setSaving(false);
    }
  };

  // ── helpers ──────────────────────────────────────────────────────────────────
  const Slider = ({ label, k, min = 0, max = 200 }: { label: string; k: keyof Adjustments; min?: number; max?: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-gray-600">
        <span>{label}</span>
        <span className="text-blue-600">{adj[k] as number}{k === "scale" ? "%" : "%"}</span>
      </div>
      <input type="range" min={min} max={max}
        value={adj[k] as number}
        onChange={e => setAdj(a => ({ ...a, [k]: Number(e.target.value) }))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#003399" }}
      />
    </div>
  );

  const Tab = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className="flex-1 py-2 text-xs font-black rounded-lg transition-all"
      style={{
        background: activeTab === id ? "#003399" : "#f1f5f9",
        color: activeTab === id ? "white" : "#374151",
      }}
    >{label}</button>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: "960px", maxHeight: "96vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0a0a2e,#003399)" }}>
          <h2 className="text-white font-black text-base">✏️ تعديل الصورة</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl font-black">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-3 bg-gray-900 overflow-auto min-h-0">
            {!loaded ? (
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full rounded-lg shadow-xl cursor-move"
                style={{ maxHeight: "55vh" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
            )}
          </div>

          {/* Panel */}
          <div className="w-full md:w-72 flex flex-col gap-3 p-4 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-100 flex-shrink-0">

            {/* Tabs */}
            <div className="flex gap-1">
              <Tab id="adjust" label="🎨 تعديل" />
              <Tab id="resize" label="📐 حجم" />
              <Tab id="text"   label="✍️ نص" />
            </div>

            {/* ── Tab: Adjust ── */}
            {activeTab === "adjust" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "↻ 90°",  fn: () => setAdj(a => ({ ...a, rotate: (a.rotate + 90) % 360 })) },
                    { label: "↺ -90°", fn: () => setAdj(a => ({ ...a, rotate: (a.rotate - 90 + 360) % 360 })) },
                    { label: "⇄ أفقي", fn: () => setAdj(a => ({ ...a, flipH: !a.flipH })), active: adj.flipH },
                    { label: "⇅ عمودي",fn: () => setAdj(a => ({ ...a, flipV: !a.flipV })), active: adj.flipV },
                  ].map((b, i) => (
                    <button key={i} type="button" onClick={b.fn}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{ background: b.active ? "#003399" : "#f1f5f9", color: b.active ? "white" : "#374151", border: "1px solid #e2e8f0" }}>
                      {b.label}
                    </button>
                  ))}
                </div>
                <Slider label="☀️ السطوع"  k="brightness" />
                <Slider label="◑ التباين"  k="contrast" />
                <Slider label="🎨 التشبع"  k="saturation" />
              </div>
            )}

            {/* ── Tab: Resize ── */}
            {activeTab === "resize" && (
              <div className="space-y-4">
                <Slider label="📐 الحجم" k="scale" min={10} max={300} />
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 75, 100, 150, 200].map(v => (
                    <button key={v} type="button"
                      onClick={() => setAdj(a => ({ ...a, scale: v }))}
                      className="py-2 rounded-lg text-xs font-black transition-all hover:scale-105"
                      style={{
                        background: adj.scale === v ? "#003399" : "#f1f5f9",
                        color: adj.scale === v ? "white" : "#374151",
                        border: "1px solid #e2e8f0",
                      }}>
                      {v}%
                    </button>
                  ))}
                </div>
                {imgRef.current && (
                  <p className="text-xs text-gray-400 text-center">
                    {Math.round(imgRef.current.naturalWidth * adj.scale / 100)} ×{" "}
                    {Math.round(imgRef.current.naturalHeight * adj.scale / 100)} px
                  </p>
                )}
              </div>
            )}

            {/* ── Tab: Text ── */}
            {activeTab === "text" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">النص</label>
                  <input
                    type="text"
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ border: "1.5px solid #c7d2fe", background: "#f8faff" }}
                    placeholder="اكتب هنا..."
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">حجم الخط</label>
                    <input type="number" min={10} max={120} value={newFontSize}
                      onChange={e => setNewFontSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ border: "1.5px solid #e2e8f0" }}
                    />
                  </div>
                  <div className="flex gap-1 mt-4">
                    <button type="button" onClick={() => setNewBold(v => !v)}
                      className="w-8 h-8 rounded-lg font-black text-sm transition-all"
                      style={{ background: newBold ? "#003399" : "#f1f5f9", color: newBold ? "white" : "#374151", border: "1px solid #e2e8f0" }}>
                      B
                    </button>
                    <button type="button" onClick={() => setNewItalic(v => !v)}
                      className="w-8 h-8 rounded-lg font-black text-sm italic transition-all"
                      style={{ background: newItalic ? "#003399" : "#f1f5f9", color: newItalic ? "white" : "#374151", border: "1px solid #e2e8f0" }}>
                      I
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">لون النص</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setNewColor(c)}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                        style={{ background: c, border: newColor === c ? "2.5px solid #003399" : "1px solid #d1d5db" }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">خلفية النص</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setNewBg("transparent")}
                      className="w-6 h-6 rounded-full text-xs flex items-center justify-center transition-transform hover:scale-125"
                      style={{ border: newBg === "transparent" ? "2.5px solid #003399" : "1px solid #d1d5db", background: "white" }}>
                      ∅
                    </button>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setNewBg(c)}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                        style={{ background: c, border: newBg === c ? "2.5px solid #003399" : "1px solid #d1d5db" }}
                      />
                    ))}
                  </div>
                </div>

                <button type="button" onClick={addText}
                  className="w-full py-2.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
                  ➕ إضافة النص
                </button>

                {texts.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">النصوص المضافة (اسحب للتحريك)</p>
                    {texts.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"
                        style={{ border: "1px solid #e2e8f0" }}>
                        <span className="text-xs text-gray-700 truncate flex-1">{t.text}</span>
                        <button type="button" onClick={() => setTexts(prev => prev.filter(x => x.id !== t.id))}
                          className="text-red-400 hover:text-red-600 font-black text-sm ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reset */}
            <button type="button" onClick={() => { setAdj({ ...DEFAULT_ADJ }); setTexts([]); }}
              className="w-full py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all mt-auto"
              style={{ border: "1.5px solid #e2e8f0" }}>
              🔄 إعادة تعيين الكل
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all"
            style={{ border: "1.5px solid #e2e8f0" }}>
            إلغاء
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !loaded}
            className="flex-1 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#003399,#0055cc)" }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ الصورة"}
          </button>
        </div>
      </div>
    </div>
  );
}
