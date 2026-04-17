"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PWAStart() {
  const router = useRouter();

  useEffect(() => {
    // اقرأ آخر صفحة كانت مفتوحة
    const lastPage = localStorage.getItem("pwa_last_page") || "/";
    router.replace(lastPage);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#003399]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-bold text-sm">Laden...</p>
      </div>
    </div>
  );
}
