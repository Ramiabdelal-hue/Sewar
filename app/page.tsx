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
          <div className="flex items-center justify-between gap-2 flex-wrap">

            {/* Sewar Achour + BTW */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                <span className="text-sm">©</span>
              </div>
              <div>
                <p className="font-black text-xs tracking-wide" style={{ color: "#1a1a1a" }}>Sewar Achour</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>BTW nr: 0766.704.232</p>
              </div>
            </div>

            {/* حقوق النشر */}
            <p className="text-xs text-center hidden sm:block" style={{ color: "#9ca3af" }}>
              © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
              {lang === "nl" ? "Alle rechten voorbehouden" :
               lang === "fr" ? "Tous droits réservés" :
               lang === "ar" ? "جميع الحقوق محفوظة" :
               "All rights reserved"}
            </p>

            {/* المصمم */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: "#7c3aed" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xs font-bold" style={{ color: "#6b7280" }}>Designed by</span>
              <span className="text-xs font-black" style={{ color: "#4c1d95" }}>Rami Abdelal</span>
              <a
                href="https://wa.me/32465574440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold"
                style={{ color: "#25d366" }}
              >
                0465 57 44 40
              </a>
            </div>

          </div>
        </div>
      </footer>

      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}
    </div>
  );
}
