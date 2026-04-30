"use client";

import { useEffect, useState } from "react";

/**
 * Watermark — علامة مائية ثابتة على كل الصفحات
 * تظهر email المستخدم + timestamp
 */
export default function Watermark() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      setEmail(userEmail);
    } catch {
      setEmail(null);
    }
  }, []);

  // لا نعرض watermark إذا لم يكن المستخدم مسجل دخول
  if (!email) return null;

  const timestamp = new Date().toLocaleString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed pointer-events-none select-none z-[9999]"
      style={{
        bottom: "10px",
        right: "10px",
        fontSize: "10px",
        color: "rgba(0,0,0,0.15)",
        fontWeight: "600",
        textAlign: "right",
        lineHeight: "1.3",
        textShadow: "0 0 2px rgba(255,255,255,0.5)",
      }}
    >
      <div>{email}</div>
      <div>{timestamp}</div>
    </div>
  );
}
