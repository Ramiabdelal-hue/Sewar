"use client";

import { useLang } from "@/context/LangContext";

export default function Footer() {
  const { lang } = useLang();

  const rights = {
    nl: "Alle rechten voorbehouden",
    fr: "Tous droits réservés",
    ar: "جميع الحقوق محفوظة",
    en: "All rights reserved",
  };

  return (
    <footer style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* ── اليسار: Sewar Achour ── */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,204,0,0.15)", border: "1px solid rgba(255,204,0,0.3)" }}>
              <span className="text-base">©</span>
            </div>
            <div>
              <p className="text-white font-black text-base tracking-wide">Sewar Achour</p>
              <p className="text-white/50 text-xs">BTW nr: 0766.704.232</p>
            </div>
          </div>

          {/* ── الوسط: حقوق النشر ── */}
          <div className="text-center">
            <p className="text-white/50 text-xs font-medium">
              © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
              {rights[lang as keyof typeof rights] || rights.nl}
            </p>
          </div>

          {/* ── اليمين: المصمم ── */}
          <div className="flex items-center gap-2.5">
            {/* خط فاصل عمودي على الشاشات الكبيرة */}
            <div className="hidden md:block w-px h-8 opacity-20" style={{ background: "white" }} />
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
              {/* أيقونة المصمم */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
                  Designed by
                </p>
                <p className="text-white font-black text-sm leading-none">Rami Abdelal</p>
                <a
                  href="tel:0465574440"
                  className="text-[10px] font-semibold leading-none mt-0.5 block transition-colors"
                  style={{ color: "rgba(167,139,250,0.8)" }}
                >
                  0465 57 44 40
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
