"use client";

import Image from "next/image";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { FaHome, FaBook, FaCar, FaCheckCircle, FaEnvelope, FaSignInAlt } from "react-icons/fa";

interface NavbarProps {
  onOpenLogin?: () => void;
  onTheorieClick?: () => void;
}

export default function Navbar({ onOpenLogin, onTheorieClick }: NavbarProps) {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const userEmail = localStorage.getItem("userEmail");
      setIsLoggedIn(!!userEmail);
    };
    check();
    window.addEventListener("userLoggedIn", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("userLoggedIn", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  const navLinks = [
    { label: t.home, href: "/", icon: <FaHome /> },
    { label: t.theorie, href: "/theorie", icon: <FaBook />, onClick: onTheorieClick },
    { label: t.praktical, href: "/praktical", icon: <FaCar /> },
    { label: t.examen, href: "/examen", icon: <FaCheckCircle /> },
    { label: t.contact, href: "/contact", icon: <FaEnvelope /> },
  ];

  return (
    <header dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* الشريط العلوي - أزرق */}
      <div className="bg-[#0066cc] text-white">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* اللوغو + اسم الموقع */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
            <Image src="/logo.png" alt="Logo" width={45} height={45} className="rounded" />
            <span className="text-xl md:text-2xl font-black tracking-wide uppercase">
              S &amp; A Rijacademie
            </span>
          </div>

          {/* أزرار اللغة */}
          <div className="flex gap-1">
            {[
              { code: "nl", label: "NL" },
              { code: "fr", label: "FR" },
              { code: "ar", label: "AR" },
              { code: "en", label: "EN" },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code as any)}
                className={`px-3 py-1 font-bold text-sm border-2 transition-all ${
                  lang === code
                    ? "bg-white text-[#0066cc] border-white"
                    : "bg-transparent text-white border-white/60 hover:border-white hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* الشريط الثاني - روابط التنقل */}
      <div className="bg-[#004499] text-white">
        <div className="max-w-5xl mx-auto px-4">
          {/* Desktop */}
          <ul className="hidden md:flex items-center">
            {navLinks.map((link, i) => (
              <li key={i}>
                <button
                  onClick={() => link.onClick ? link.onClick() : window.location.href = link.href}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm uppercase tracking-wide border-r border-white/20 hover:bg-[#0066cc] transition-colors"
                >
                  {link.icon}
                  {link.label}
                </button>
              </li>
            ))}

            {/* زر الدخول */}
            <li className="mr-auto" style={{ marginLeft: "auto" }}>
              {!isLoggedIn ? (
                <button
                  onClick={() => onOpenLogin ? onOpenLogin() : setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm uppercase tracking-wide bg-white text-[#0066cc] hover:bg-gray-100 transition-colors"
                >
                  <FaSignInAlt />
                  {lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem("userEmail");
                    localStorage.removeItem("userCategory");
                    localStorage.removeItem("userExpiry");
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm uppercase bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {lang === "ar" ? "خروج" : lang === "nl" ? "Uitloggen" : lang === "fr" ? "Déconnexion" : "Logout"}
                </button>
              )}
            </li>
          </ul>

          {/* Mobile - زر القائمة */}
          <div className="md:hidden flex items-center justify-between py-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 font-bold text-sm uppercase"
            >
              <span className="text-xl">☰</span>
              {lang === "ar" ? "القائمة" : "Menu"}
            </button>
            {!isLoggedIn ? (
              <button
                onClick={() => onOpenLogin ? onOpenLogin() : setShowLoginModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 font-bold text-xs uppercase bg-white text-[#0066cc]"
              >
                <FaSignInAlt />
                {lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("userCategory");
                  localStorage.removeItem("userExpiry");
                  window.location.href = "/";
                }}
                className="px-3 py-1.5 font-bold text-xs uppercase bg-red-500"
              >
                {lang === "ar" ? "خروج" : "Logout"}
              </button>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-2 flex flex-col">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => {
                    link.onClick ? link.onClick() : window.location.href = link.href;
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 font-bold text-sm uppercase border-t border-white/20 hover:bg-[#0066cc] transition-colors text-left"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLoginModal && <LoginModal lang={lang} onClose={() => setShowLoginModal(false)} />}
    </header>
  );
}
