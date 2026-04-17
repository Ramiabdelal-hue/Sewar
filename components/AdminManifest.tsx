"use client";

import { useEffect } from "react";

/**
 * يغير manifest الـ PWA لصفحات الأدمن
 * بحيث عند تثبيت التطبيق من صفحة الأدمن يفتح مباشرة على لوحة الأدمن
 */
export default function AdminManifest() {
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

    // عند مغادرة صفحة الأدمن، أعد الـ manifest الأصلي
    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/manifest.json");
    };
  }, []);

  return null;
}
