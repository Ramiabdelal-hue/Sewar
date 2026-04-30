"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister — يسجل SW مرة واحدة عند التحميل
 * بديل نظيف عن <script dangerouslySetInnerHTML> في layout
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ SW registered"))
        .catch((err) => console.warn("SW error:", err));
    }
  }, []);

  return null;
}
