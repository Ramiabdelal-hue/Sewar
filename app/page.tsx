"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoginModal from "@/components/LoginModal";
import CheckoutForm from "@/components/CheckoutForm";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang] || nl;
  const isRtl = lang === "ar";

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Navbar onOpenLogin={() => setShowLogin(true)} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Hero onSelect={() => setShowCheckout(true)} />
      </div>

      {/* Footer */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e5e7eb", flexShrink: 0 }} dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">

            {/* صاحبة الموقع */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: "#ea580c" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ea580c" }}>{t.siteOwner}</p>
                <p className="font-black text-xs tracking-wide" style={{ color: "#1a1a1a" }}>Sewar Achour</p>
                <p className="text-[10px]" style={{ color: "#9ca3af" }}>BTW: 0766.704.232</p>
              </div>
            </div>

            {/* حقوق النشر — مخفي على الموبايل */}
            <p className="text-[10px] text-center hidden md:block" style={{ color: "#9ca3af" }}>
              © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
              {t.gratis === "مجاني" ? "جميع الحقوق محفوظة" :
               lang === "nl" ? "Alle rechten voorbehouden" :
               lang === "fr" ? "Tous droits réservés" :
               "All rights reserved"}
            </p>

            {/* المصمم */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: "#7c3aed" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#7c3aed" }}>{t.webDesigner}</p>
                <p className="font-black text-xs tracking-wide" style={{ color: "#1a1a1a" }}>Rami Abdelal</p>
                <a href="https://wa.me/32465574440" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "#25d366" }}>
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.727.977.994-3.634-.235-.374A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  0465 57 44 40
                </a>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}
    </div>
  );
}
