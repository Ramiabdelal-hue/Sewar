"use client";

import { useEffect, useState } from "react";

export default function AdminManifest() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // تغيير manifest فوراً عند تحميل الصفحة
    const setAdminManifest = () => {
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "manifest";
        document.head.appendChild(link);
      }
      link.href = "/manifest-admin.json";
    };

    setAdminManifest();

    // التحقق إذا كان التطبيق مثبتاً بالفعل
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      // إعادة manifest الأصلي عند مغادرة الصفحة
      const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (link) link.href = "/manifest.json";
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      // Android Chrome - يظهر prompt تلقائي
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
    } else {
      // iPhone أو متصفح لا يدعم prompt
      setShowGuide(true);
    }
  };

  if (installed) return null;

  return (
    <>
      {/* زر التثبيت */}
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
        style={{ background: "rgba(99,102,241,0.8)", color: "white", border: "1px solid rgba(99,102,241,0.5)" }}
        title="تثبيت تطبيق الأدمن"
      >
        📲 تثبيت
      </button>

      {/* دليل التثبيت اليدوي (iPhone / Safari) */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mb-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-gray-800 mb-4 text-center">📲 تثبيت تطبيق الأدمن</h3>

            {/* iPhone */}
            <div className="mb-4">
              <p className="text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-xl">🍎</span> iPhone (Safari)
              </p>
              <div className="space-y-2">
                {[
                  "اضغط زر المشاركة ⬆️ في أسفل Safari",
                  "مرر للأسفل → اضغط 'Add to Home Screen'",
                  "اضغط Add في الأعلى الأيمن",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-blue-50 rounded-xl p-2.5 font-medium">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-black flex-shrink-0 text-xs">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Android */}
            <div className="mb-5">
              <p className="text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-xl">🤖</span> Android (Chrome)
              </p>
              <div className="space-y-2">
                {[
                  "اضغط القائمة ⋮ في أعلى يمين Chrome",
                  "اضغط 'Add to Home Screen' أو 'Install App'",
                  "اضغط Install للتأكيد",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-green-50 rounded-xl p-2.5 font-medium">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-black flex-shrink-0 text-xs">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)" }}
            >
              فهمت ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
