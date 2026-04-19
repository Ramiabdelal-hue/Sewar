"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PWAStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isAdmin = searchParams.get("admin") === "1";

    if (isAdmin) {
      window.location.href = "/admin/questions";
      return;
    }

    const lastPage = localStorage.getItem("pwa_last_page") || "/";
    window.location.href = lastPage;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#003399]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-bold text-sm">Laden...</p>
      </div>
    </div>
  );
}

export default function PWAStart() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#003399]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-sm">Laden...</p>
        </div>
      </div>
    }>
      <PWAStartContent />
    </Suspense>
  );
}
