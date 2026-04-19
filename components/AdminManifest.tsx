"use client";

import { useEffect, useState } from "react";

export default function AdminManifest() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // غير manifest للأدمن
    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) existing.setAttribute("href", "/manifest-admin.json");
    else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest-admin.json";
      document.head.appendChild(link);
    }

    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/manifest.json");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* زر تثبيت في الـ header - inline وليس fixed */}
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
        style={{ background: "rgba(99,102,241,0.7)", color: "white", border: "1px solid rgba(99,102,241,0.4)" }}
      >
        📲 تثبيت
      </button>

      {/* دليل التثبيت */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowGuide(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mb-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-800 mb-3 text-center">📲 تثبيت تطبيق الأدمن</h3>

            <div className="mb-4 p-3 rounded-xl text-xs font-bold text-center" style={{ background: "#fef3c7", border: "1.5px solid #f59e0b" }}>
              ⚠️ تأكد أنك الآن على صفحة<br/>
              <span className="text-[#003399] font-black">/admin/questions</span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-black text-gray-700 mb-2">🍎 iPhone (Safari):</p>
              <div className="space-y-1.5">
                {[
                  "1️⃣ اضغط زر المشاركة ⬆️ في أسفل Safari",
                  "2️⃣ مرر للأسفل → اضغط 'Add to Home Screen'",
                  "3️⃣ اضغط Add في الأعلى",
                ].map((step, i) => (
                  <div key={i} className="text-xs text-gray-700 bg-blue-50 rounded-lg p-2 font-medium">{step}</div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-black text-gray-700 mb-2">🤖 Android (Chrome):</p>
              <div className="space-y-1.5">
                {[
                  "1️⃣ اضغط القائمة ⋮ في أعلى يمين Chrome",
                  "2️⃣ اضغط 'Add to Home Screen'",
                  "3️⃣ اضغط Install",
                ].map((step, i) => (
                  <div key={i} className="text-xs text-gray-700 bg-blue-50 rounded-lg p-2 font-medium">{step}</div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}
            >
              فهمت ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
