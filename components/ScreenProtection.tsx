"use client";

import { useEffect, useRef } from "react";

export default function ScreenProtection() {
  const overlayRef = useRef<HTMLDivElement>(null);

  const showOverlay = () => {
    if (overlayRef.current) overlayRef.current.style.display = "flex";
  };
  const hideOverlay = () => {
    if (overlayRef.current) overlayRef.current.style.display = "none";
  };

  // تسجيل محاولة Screenshot الحقيقية فقط
  const logScreenshotAttempt = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userEmail || null,
          eventType: "screenshot_attempt",
          page: window.location.pathname,
        }),
      });
    } catch {}
  };

  useEffect(() => {
    // ── 1. منع Right-click ────────────────────────────────────────────────
    const noContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", noContext);

    // ── 2. منع تحديد النص ────────────────────────────────────────────────
    const noSelect = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", noSelect);

    // ── 3. منع Drag ──────────────────────────────────────────────────────
    const noDrag = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragstart", noDrag);

    // ── 4. مفاتيح الحماية ────────────────────────────────────────────────
    // نستخدم keydown فقط (ليس keyup) لتجنب التسجيل مرتين
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Print Screen - التسجيل هنا فقط (keydown)
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        showOverlay();
        logScreenshotAttempt(); // ← مرة واحدة فقط
        navigator.clipboard?.writeText("").catch(() => {});
        setTimeout(hideOverlay, 2000);
        return;
      }

      // Ctrl+P طباعة
      if (ctrl && e.key === "p") { e.preventDefault(); return; }
      // Ctrl+S حفظ
      if (ctrl && e.key === "s") { e.preventDefault(); return; }
      // Ctrl+U مصدر الصفحة
      if (ctrl && e.key === "u") { e.preventDefault(); return; }
      // F12 / DevTools
      if (e.key === "F12") { e.preventDefault(); return; }
      if (ctrl && e.shiftKey && ["i","I","j","J","c","C"].includes(e.key)) {
        e.preventDefault(); return;
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // ── 5. منع الطباعة عبر CSS ───────────────────────────────────────────
    const printStyle = document.createElement("style");
    printStyle.id = "__no-print__";
    printStyle.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          content: "🔒 هذا المحتوى محمي ولا يمكن طباعته";
          visibility: visible !important;
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px; font-weight: 900; color: #003399;
        }
      }
    `;
    document.head.appendChild(printStyle);

    return () => {
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("selectstart", noSelect);
      document.removeEventListener("dragstart", noDrag);
      document.removeEventListener("keydown", onKeyDown);
      document.getElementById("__no-print__")?.remove();
    };
  }, []);

  return (
    <>
      {/* Overlay تعتيم */}
      <div
        ref={overlayRef}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          background: "#000",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          cursor: "pointer",
        }}
        onClick={hideOverlay}
      >
        <div style={{ fontSize: "56px" }}>🔒</div>
        <p style={{ color: "white", fontWeight: "900", fontSize: "20px", margin: 0 }}>
          محتوى محمي
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
          Protected Content — اضغط للمتابعة
        </p>
      </div>

      <style>{`
        img {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          -webkit-touch-callout: none !important;
        }
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          user-select: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        @media print {
          body * { visibility: hidden !important; }
          body::after {
            content: "🔒 هذا المحتوى محمي";
            visibility: visible !important;
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px; font-weight: 900; color: #003399;
          }
        }
      `}</style>
    </>
  );
}
