"use client";

import Image from "next/image";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // دالة تغيير اللغة مع Google Translate
  const changeLang = (code: string) => {
    setLang(code as any);
    // استدعاء Google Translate
    try {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        const gtLang: Record<string, string> = { nl: 'nl', fr: 'fr', ar: 'ar', en: 'en' };
        select.value = gtLang[code] || code;
        select.dispatchEvent(new Event('change'));
      }
    } catch {}
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  useEffect(() => {
    const check = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setIsLoggedIn(false);
        setDaysLeft(null);
        return;
      }
      setIsLoggedIn(true);

      try {
        // جلب تاريخ الانتهاء من قاعدة البيانات مباشرة
        const res = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await res.json();

        if (data.success && data.user?.expiryDate) {
          const expiry = new Date(data.user.expiryDate).getTime();
          const diff = expiry - Date.now();
          if (diff <= 0) {
            setIsExpired(true);
            setDaysLeft(0);
          } else {
            setIsExpired(false);
            setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000); // كل ساعة
    window.addEventListener("userLoggedIn", check);
    window.addEventListener("storage", check);
    return () => {
      clearInterval(interval);
      window.removeEventListener("userLoggedIn", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  const navLinks = [
    { label: t.home, href: "/", icon: <FaHome /> },
    { label: t.theorie, href: "/theorie", icon: <FaBook />, onClick: onTheorieClick },
    { label: t.praktical, href: "/praktical", icon: <FaCar /> },
    { label: t.contact, href: "/contact", icon: <FaEnvelope /> },
  ];

  return (
    <header dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* الشريط العلوي - أزرق */}
      <div className="bg-[#0066cc] text-white">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center justify-between">
          {/* اللوغو + اسم الموقع */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
            <span className="text-base md:text-2xl font-black tracking-wide uppercase hidden sm:inline">
              Sewar VerkeersSchool
            </span>
            <span className="text-base font-black tracking-wide uppercase sm:hidden">
              Sewar VerkeersSchool
            </span>
          </div>

          {/* أزرار اللغة + Inloggen */}
          <div className="flex flex-col items-end gap-1">
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
                  onClick={() => changeLang(code)}
                  className={`px-2 py-1 md:px-3 md:py-1 font-bold text-xs md:text-sm border-2 transition-all ${
                    lang === code
                      ? "bg-white text-[#0066cc] border-white"
                      : "bg-transparent text-white border-white/60 hover:border-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* زر تثبيت PWA - يظهر فقط في الصفحة الرئيسية */}
            {showInstall && pathname === "/" && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-1.5 py-1 font-black text-xs uppercase tracking-wide transition-all active:scale-95 hover:scale-105 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "white",
                  boxShadow: "0 2px 12px rgba(34,197,94,0.5)",
                  borderRadius: "2px",
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {lang === "ar" ? "تثبيت التطبيق" : lang === "nl" ? "App installeren" : lang === "fr" ? "Installer l'app" : "Install App"}
              </button>
            )}

            {/* زر Inloggen يغطي نفس عرض الأزرار الأربعة */}
            {!isLoggedIn ? (
              <button
                onClick={() => onOpenLogin ? onOpenLogin() : setShowLoginModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1 font-black text-xs uppercase tracking-wide transition-all active:scale-95 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}
              >
                <FaSignInAlt className="text-xs" />
                {lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
              </button>
            ) : (
              <div className="flex items-center gap-1 w-full">
                {daysLeft !== null && (
                  <span className={`px-2 py-0.5 text-xs font-black flex-shrink-0 ${
                    isExpired ? "bg-red-600 text-white" :
                    daysLeft <= 3 ? "bg-orange-500 text-white" :
                    "bg-white/20 text-white"
                  }`}>
                    {isExpired ? "!" : `${daysLeft}d`}
                  </span>
                )}
                <button
                  onClick={() => { localStorage.removeItem("userEmail"); localStorage.removeItem("userCategory"); localStorage.removeItem("userExpiry"); window.location.href = "/"; }}
                  className="flex-1 py-0.5 text-xs font-black uppercase bg-red-500 hover:bg-red-600 transition-colors text-white text-center"
                >
                  {lang === "ar" ? "خروج" : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الشريط الثاني - روابط التنقل */}
      <div className="bg-[#004499] text-white">
        <div className="max-w-5xl mx-auto px-4">
          {/* Desktop */}
          <ul className="hidden md:flex items-center">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <li key={i}>
                  <button
                    onClick={() => link.onClick ? link.onClick() : window.location.href = link.href}
                    className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm uppercase tracking-wide border-r border-white/20 transition-colors ${
                      isActive
                        ? "bg-white text-[#0066cc]"
                        : "hover:bg-[#0066cc] text-white"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                </li>
              );
            })}

            {/* زر الدخول محذوف - في الشريط العلوي */}
          </ul>

          {/* Mobile - زر القائمة */}
          <div className="md:hidden flex items-center justify-between py-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 font-bold text-sm uppercase px-2"
            >
              <span className="text-xl">{isMobileMenuOpen ? "✕" : "☰"}</span>
              <span className="text-xs">{lang === "ar" ? "القائمة" : "Menu"}</span>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-2 flex flex-col">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <button
                    key={i}
                    onClick={() => {
                      link.onClick ? link.onClick() : window.location.href = link.href;
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 font-bold text-sm uppercase border-t border-white/20 transition-colors text-left ${
                      isActive ? "bg-white text-[#0066cc]" : "hover:bg-[#0066cc]"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showLoginModal && <LoginModal lang={lang} onClose={() => setShowLoginModal(false)} />}
    </header>
  );
}
