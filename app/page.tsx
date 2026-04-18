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
    <>
      <Navbar onOpenLogin={() => setShowLogin(true)} />
      <Hero onSelect={() => setShowCheckout(true)} />
      
      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} />}
      {showCheckout && <CheckoutForm selectedData={{}} onBack={() => setShowCheckout(false)} />}

      {/* زر واتساب عائم - في الصفحة الرئيسية فقط */}
      <a
        href="https://wa.me/32470813725"
        target="_blank"
        className="wa-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.675 4.797 1.85 6.787L2 30l7.4-1.825A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.8-1.575l-.415-.245-4.395 1.085 1.11-4.27-.27-.44A11.46 11.46 0 014.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.61c-.345-.172-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.775.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.455-.537-2.77-1.71-1.024-.913-1.715-2.04-1.915-2.385-.2-.345-.021-.531.15-.703.155-.155.345-.4.517-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.6-.086-.172-.775-1.868-1.062-2.558-.28-.672-.563-.58-.775-.59l-.66-.011c-.23 0-.6.086-.915.43-.315.345-1.2 1.173-1.2 2.86s1.228 3.318 1.4 3.548c.172.23 2.415 3.688 5.853 5.17.818.353 1.457.563 1.954.72.821.26 1.569.223 2.16.135.659-.098 2.04-.833 2.327-1.638.287-.805.287-1.495.2-1.638-.086-.143-.315-.23-.66-.4z"/>
        </svg>
      </a>

      {/* Footer - حقوق النشر */}
      <footer style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* خط فاصل */}
          <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* اليسار - اسم الشركة */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,204,0,0.15)", border: "1px solid rgba(255,204,0,0.3)" }}>
                <span className="text-sm">©</span>
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-wide">Sewar Achour</p>
                <p className="text-white/40 text-xs">BTW nr: 0766.704.232</p>
              </div>
            </div>

            {/* الوسط - حقوق النشر */}
            <div className="text-center">
              <p className="text-white/50 text-xs">
                © {new Date().getFullYear()} Sewar Rijbewijsonline.{" "}
                {lang === "nl" ? "Alle rechten voorbehouden" :
                 lang === "fr" ? "Tous droits réservés" :
                 lang === "ar" ? "جميع الحقوق محفوظة" :
                 "All rights reserved"}
              </p>
            </div>

            {/* اليمين - اسم */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/40 text-xs">Sewar Achour</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
