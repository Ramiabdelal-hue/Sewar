"use client";

import { useEffect, useState } from "react";

export default function AdminManifest() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
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

    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);

    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/manifest.json");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") { setInstalled(true); setInstallPrompt(null); }
    } else {
      setShowGuide(true);
    }
  };

  if (installed) return null;

  return (
    <>
      {/* زر التثبيت */}
      <button
        onClick={handleInstall}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}
      >
        📲 تثبيت تطبيق الأدمن
      </button>

      {/* دليل التثبيت اليدوي */}
      {showGuide && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mb-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-800 mb-4 text-center">📲 تثبيت تطبيق الأدمن</h3>

            {/* تأكيد أنك على الصفحة الصحيحة */}
            <div className="mb-4 p-3 rounded-xl text-xs font-bold text-center" style={{ background: "#fef3c7", border: "1.5px solid #f59e0b" }}>
              ⚠️ تأكد أنك الآن على صفحة<br/>
              <span className="text-[#003399] font-black">/admin/questions</span>
            </div>

            {/* iPhone */}
            <div className="mb-4">
              <p className="text-sm font-black text-gray-700 mb-2">🍎 iPhone (Safari):</p>
              <div className="space-y-2">
                {[
                  "1️⃣ اضغط زر المشاركة ⬆️ في أسفل Safari",
                  "2️⃣ مرر للأسفل واضغط 'Add to Home Screen'",
                  "3️⃣ غيّر الاسم إلى 'Sewar Admin' ثم اضغط Add",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Android */}
            <div className="mb-5">
              <p className="text-sm font-black text-gray-700 mb-2">🤖 Android (Chrome):</p>
              <div className="space-y-2">
                {[
                  "1️⃣ اضغط القائمة ⋮ في أعلى يمين Chrome",
                  "2️⃣ اضغط 'Add to Home Screen' أو 'Install App'",
                  "3️⃣ اضغط Install للتأكيد",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}>
              فهمت ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
