"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32"];
const COLORS = [
  "#000000", "#1a1a1a", "#374151", "#6b7280",
  "#003399", "#0055cc", "#2563eb", "#60a5fa",
  "#16a34a", "#22c55e", "#f97316", "#ef4444",
  "#7c3aed", "#d97706", "#0891b2", "#be185d",
];

export default function RichTextEditor({ value, onChange, placeholder = "اكتب هنا...", minHeight = "120px" }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const isUpdating = useRef(false);

  // تحديث المحتوى عند تغيير الـ value من الخارج
  useEffect(() => {
    if (editorRef.current && !isUpdating.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleChange();
  };

  const handleChange = () => {
    isUpdating.current = true;
    onChange(editorRef.current?.innerHTML || "");
    setTimeout(() => { isUpdating.current = false; }, 0);
  };

  const setFontSize = (size: string) => {
    editorRef.current?.focus();
    // execCommand fontSize يقبل 1-7 فقط، نستخدم span بدلاً منه
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    range.surroundContents(span);
    handleChange();
  };

  const ToolBtn = ({ onClick, title, children, active = false }: {
    onClick: () => void; title: string; children: React.ReactNode; active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className="w-7 h-7 rounded flex items-center justify-center text-xs font-black transition-all hover:scale-110"
      style={{
        background: active ? "#003399" : "#f1f5f9",
        color: active ? "white" : "#374151",
        border: "1px solid #e2e8f0",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #c7d2fe" }}>
      {/* شريط الأدوات */}
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-1.5"
        style={{ background: "#f8faff", borderBottom: "1px solid #e2e8f0" }}
      >
        {/* Bold / Italic / Underline */}
        <ToolBtn onClick={() => exec("bold")} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Underline"><u>U</u></ToolBtn>

        <div style={{ width: "1px", height: "20px", background: "#e2e8f0", margin: "0 2px" }} />

        {/* حجم الخط */}
        <select
          title="حجم الخط"
          onMouseDown={e => e.stopPropagation()}
          onChange={e => setFontSize(e.target.value)}
          defaultValue=""
          className="h-7 px-1 rounded text-xs font-bold focus:outline-none"
          style={{ border: "1px solid #e2e8f0", background: "#f1f5f9", color: "#374151" }}
        >
          <option value="" disabled>حجم</option>
          {FONT_SIZES.map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div style={{ width: "1px", height: "20px", background: "#e2e8f0", margin: "0 2px" }} />

        {/* لون النص */}
        <div className="relative">
          <button
            type="button"
            title="لون النص"
            onMouseDown={e => { e.preventDefault(); setShowColorPicker(v => !v); setShowBgPicker(false); }}
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-black transition-all hover:scale-110"
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
          >
            <span style={{ borderBottom: "3px solid #ef4444", lineHeight: 1 }}>A</span>
          </button>
          {showColorPicker && (
            <div
              className="absolute top-8 left-0 z-50 p-2 rounded-xl shadow-xl grid gap-1"
              style={{ background: "white", border: "1px solid #e2e8f0", gridTemplateColumns: "repeat(8, 1fr)", width: "160px" }}
            >
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); exec("foreColor", c); setShowColorPicker(false); }}
                  className="w-5 h-5 rounded-full hover:scale-125 transition-transform"
                  style={{ background: c, border: "1px solid rgba(0,0,0,0.1)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* لون الخلفية */}
        <div className="relative">
          <button
            type="button"
            title="لون الخلفية"
            onMouseDown={e => { e.preventDefault(); setShowBgPicker(v => !v); setShowColorPicker(false); }}
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-black transition-all hover:scale-110"
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
          >
            <span style={{ background: "#fef08a", padding: "0 2px", borderRadius: "2px", lineHeight: 1 }}>A</span>
          </button>
          {showBgPicker && (
            <div
              className="absolute top-8 left-0 z-50 p-2 rounded-xl shadow-xl grid gap-1"
              style={{ background: "white", border: "1px solid #e2e8f0", gridTemplateColumns: "repeat(8, 1fr)", width: "160px" }}
            >
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); exec("hiliteColor", c); setShowBgPicker(false); }}
                  className="w-5 h-5 rounded-full hover:scale-125 transition-transform"
                  style={{ background: c, border: "1px solid rgba(0,0,0,0.1)" }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ width: "1px", height: "20px", background: "#e2e8f0", margin: "0 2px" }} />

        {/* محاذاة */}
        <ToolBtn onClick={() => exec("justifyRight")} title="يمين">⇥</ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="وسط">≡</ToolBtn>
        <ToolBtn onClick={() => exec("justifyLeft")} title="يسار">⇤</ToolBtn>

        <div style={{ width: "1px", height: "20px", background: "#e2e8f0", margin: "0 2px" }} />

        {/* قوائم */}
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="قائمة نقطية">•≡</ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="قائمة مرقمة">1≡</ToolBtn>

        <div style={{ width: "1px", height: "20px", background: "#e2e8f0", margin: "0 2px" }} />

        {/* مسح التنسيق */}
        <ToolBtn onClick={() => exec("removeFormat")} title="مسح التنسيق">✕</ToolBtn>
      </div>

      {/* منطقة الكتابة */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onBlur={handleChange}
        data-placeholder={placeholder}
        className="px-4 py-3 text-sm text-gray-800 focus:outline-none"
        style={{
          minHeight,
          background: "#f8faff",
          lineHeight: "1.7",
          direction: "auto",
        }}
        onClick={() => { setShowColorPicker(false); setShowBgPicker(false); }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
