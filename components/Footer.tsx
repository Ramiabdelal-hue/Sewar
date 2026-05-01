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
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,204,0,0.15)", border: "1px solid rgba(255,204,0,0.3)" }}>
              <span className="text-base">©</span>
            </div>
            <div>
              <p className="text-white font-black text-base tracking-wide">Sewar Achour</p>
              <p className="text-white/50 text-sm">BTW nr: 0766.704.232</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">
              © {new Date().getFullYear()} Sewar Rijbewijs Online.{" "}
              {rights[lang as keyof typeof rights] || rights.nl}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
