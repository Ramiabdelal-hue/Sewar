"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoginModal from "@/components/LoginModal";
import CheckoutForm from "@/components/CheckoutForm";
import { useLang } from "@/context/LangContext";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { lang, setLang } = useLang();

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Navbar onOpenLogin={() => setShowLogin(true)} />
      {/* Hero يملأ المساحة المتبقية */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Hero onSelect={() => setShowCheckout(true)} />
      </div>
      {/* Footer ثابت في الأسفل */}
      <footer style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 100%)", flexShrink: 0 }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,204,0,0.15)", border: "1px solid rgba(255,204,0,0.3)" }}>
                <span className="text-xs">©</span>
              </div>
              <div>
                <p className="text-white font-black text-xs tracking-wide">Sewar Achour</p>
                <p className="text-white/40 text-xs">BTW nr: 0766.704.232</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs">
                © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
                {lang === "nl" ? "Alle rechten voorbehouden" :
                 lang === "fr" ? "Tous droits réservés" :
                 lang === "ar" ? "جميع الحقوق محفوظة" :
                 "All rights reserved"}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}
    </div>
  );
}
