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
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                <span className="text-sm">©</span>
              </div>
              <div>
                <p className="font-black text-xs tracking-wide" style={{ color: "#1a1a1a" }}>Sewar Achour</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>BTW nr: 0766.704.232</p>
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: "#9ca3af" }}>
              © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
              {lang === "nl" ? "Alle rechten voorbehouden" :
               lang === "fr" ? "Tous droits réservés" :
               lang === "ar" ? "جميع الحقوق محفوظة" :
               "All rights reserved"}
            </p>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}
    </div>
  );
}
