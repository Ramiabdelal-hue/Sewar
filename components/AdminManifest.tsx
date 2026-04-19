"use client";

import { useEffect, useState } from "react";

/**
 * يغير manifest الـ PWA لصفحات الأدمن
 * بحيث عند تثبيت التطبيق من صفحة الأدمن يفتح مباشرة على لوحة الأدمن
 */
export default function AdminManifest() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // غير رابط الـ manifest للأدمن
    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) {
      existing.setAttribute("href", "/manifest-admin.json");
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest-admin.json";
      document.head.appendChild(link);
    }

    // التقط حدث التثبيت
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // تحقق إذا كان مثبتاً بالفعل
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    // عند مغادرة صفحة الأدمن، أعد الـ manifest الأصلي
    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/manifest.json");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      // iOS أو لا يوجد prompt - أظهر تعليمات يدوية
      alert(
        "لتثبيت تطبيق الأدمن:\n\n" +
        "📱 iPhone: اضغط زر المشاركة ⬆️ ثم 'إضافة إلى الشاشة الرئيسية'\n\n" +
        "🤖 Android: اضغط القائمة ⋮ ثم 'إضافة إلى الشاشة الرئيسية'"
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  };

  if (installed) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}
      title="تثبيت تطبيق الأدمن"
    >
      📲 تثبيت تطبيق الأدمن
    </button>
  );
}
