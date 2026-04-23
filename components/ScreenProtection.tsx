"use client";

import { useEffect, useRef } from "react";

// متغير global على مستوى النافذة - لا يُعاد تهيئته عند re-render أو navigation
declare global {
  interface Window { __screenProtectionRegistered?: boolean; }
}

export default function ScreenProtection() {
  const overlayRef = useRef<HTMLDivElement>(null);

  const showOverlay = () => {
    if (overlayRef.current) overlayRef.current.style.display = "flex";
  };
  const hideOverlay = () => {
    if (overlayRef.current) overlayRef.current.style.display = "none";
  };

  // debounce لمنع تسجيل نفس المحاولة مرتين في ثانية واحدة
  let lastLogTime = 0;
  const logScreenshotAttempt = async () => {
    const now = Date.now();
    if (now - lastLogTime < 1000) return; // تجاهل إذا أُرسل منذ أقل من ثانية
    lastLogTime = now;
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
    // منع التسجيل المتكرر عبر re-renders وnavigations
    if (window.__screenProtectionRegistered) return;
    window.__screenProtectionRegistered = true;

    const noContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", noContext);

    const noSelect = (e: Event) => e.preventDefault();
    document.addEventListener("selectstart", noSelect);

    const noDrag = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragstart", noDrag);

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // PrintScreen فقط = screenshot حقيقي
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        showOverlay();
        logScreenshotAttempt();
        navigator.clipboard?.writeText("").catch(() => {});
        setTimeout(hideOverlay, 2000);
        return;
      }
      if (ctrl && e.key === "p") { e.preventDefault(); return; }
      if (ctrl && e.key === "s") { e.preventDefault(); return; }
      if (ctrl && e.key === "u") { e.preventDefault(); return; }
      if (e.key === "F12") { e.preventDefault(); return; }
      if (ctrl && e.shiftKey && ["i","I","j","J","c","C"].includes(e.key)) {
        e.preventDefault(); return;
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const printStyle = document.createElement("style");
    printStyle.id = "__no-print__";
    printStyle.textContent = `@media print { body * { visibility: hidden !important; } }`;
    if (!document.getElementById("__no-print__")) {
      document.head.appendChild(printStyle);
    }
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        style={{
          display: "none", position: "fixed", inset: 0,
          zIndex: 2147483647, background: "#000",
          alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "16px", cursor: "pointer",
        }}
        onClick={hideOverlay}
      >
        <div style={{ fontSize: "56px" }}>🔒</div>
        <p style={{ color: "white", fontWeight: "900", fontSize: "20px", margin: 0 }}>محتوى محمي</p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>Protected Content — اضغط للمتابعة</p>
      </div>

      <style>{`
        img { -webkit-user-drag: none !important; user-drag: none !important; -webkit-touch-callout: none !important; }
        body { -webkit-user-select: none !important; -moz-user-select: none !important; user-select: none !important; }
        input, textarea { -webkit-user-select: text !important; user-select: text !important; }
        @media print {
          body * { visibility: hidden !important; }
          body::after { content: "🔒 هذا المحتوى محمي"; visibility: visible !important; position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 28px; font-weight: 900; color: #003399; }
        }
      `}</style>
    </>
  );
}
