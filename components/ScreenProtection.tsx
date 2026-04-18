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

  useEffect(() => {
    // ── 1. منع Right-click ─────────────────────────────────────────────────
    const noContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", noContext);

    // ── 2. منع تحديد النص ─────────────────────────────────────────────────
    const noSelect = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", noSelect);

    // ── 3. منع Drag ────────────────────────────────────────────────────────
    const noDrag = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragstart", noDrag);

    // ── 4. مفاتيح الحماية ──────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Print Screen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        showOverlay();
        navigator.clipboard?.writeText("").catch(() => {});
        setTimeout(hideOverlay, 2000);
        return false;
      }
      // Ctrl+P طباعة
      if (ctrl && e.key === "p") { e.preventDefault(); return false; }
      // Ctrl+S حفظ
      if (ctrl && e.key === "s") { e.preventDefault(); return false; }
      // Ctrl+U مصدر الصفحة
      if (ctrl && e.key === "u") { e.preventDefault(); return false; }
      // F12 / Ctrl+Shift+I DevTools
      if (e.key === "F12") { e.preventDefault(); return false; }
      if (ctrl && e.shiftKey && ["i","I","j","J","c","C"].includes(e.key)) {
        e.preventDefault(); return false;
      }
    };

    // keyup للـ PrintScreen (بعض المتصفحات تطلقه هنا)
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        showOverlay();
        navigator.clipboard?.writeText("").catch(() => {});
        setTimeout(hideOverlay, 2000);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // ── 5. تعتيم عند تغيير visibility (Alt+Tab / screenshot tools) ─────────
    const onVisibility = () => {
      if (document.hidden) {
        showOverlay();
      } else {
        setTimeout(hideOverlay, 400);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── 6. منع الطباعة عبر CSS ─────────────────────────────────────────────
    const printStyle = document.createElement("style");
    printStyle.id = "__no-print__";
    printStyle.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          content: "🔒 هذا المحتوى محمي ولا يمكن طباعته";
          visibility: visible !important;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          font-weight: 900;
          color: #003399;
        }
      }
    `;
    document.head.appendChild(printStyle);

    return () => {
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("selectstart", noSelect);
      document.removeEventListener("dragstart", noDrag);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.getElementById("__no-print__")?.remove();
    };
  }, []);

  return (
    <>
      {/* ── Overlay تعتيم كامل ─────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 2147483647, // أعلى قيمة ممكنة
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

      {/* ── CSS حماية شاملة ────────────────────────────────────────────── */}
      <style>{`
        /* منع سحب الصور */
        img {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          user-drag: none !important;
          -webkit-touch-callout: none !important;
        }

        /* منع تحديد النص في كل مكان */
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* السماح بالتحديد في حقول الإدخال فقط */
        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }

        /* CSS overlay على الصور — يجعلها تظهر بشكل سيء عند screenshot */
        .img-protected {
          position: relative;
          display: inline-block;
        }
        .img-protected::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 3px,
            rgba(0, 51, 153, 0.08) 3px,
            rgba(0, 51, 153, 0.08) 6px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* منع الطباعة */
        @media print {
          body * { visibility: hidden !important; }
          body::after {
            content: "🔒 هذا المحتوى محمي";
            visibility: visible !important;
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px;
            font-weight: 900;
            color: #003399;
          }
        }
      `}</style>
    </>
  );
}
