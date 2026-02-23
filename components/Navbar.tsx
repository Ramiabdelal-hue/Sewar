"use client";

import Image from "next/image";
import { FaHome, FaBook, FaCar, FaCheckCircle, FaEnvelope, FaSignInAlt, FaClock } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";

interface NavbarProps {
  onOpenLogin?: () => void;
  onTheorieClick?: () => void;
}

export default function Navbar({ onOpenLogin, onTheorieClick }: NavbarProps) {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const userEmail = localStorage.getItem("userEmail");
      
      console.log("🔍 Checking subscription for:", userEmail);
      
      if (!userEmail) {
        setIsLoggedIn(false);
        setTimeRemaining(null);
        return;
      }

      setIsLoggedIn(true);

      try {
        const response = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });

        const data = await response.json();
        console.log("📊 Subscription data:", data);
        
        if (data.success && data.user?.expiryDate) {
          setUserName(data.user.name || data.user.email);
          
          const expiryDate = new Date(data.user.expiryDate);
          const now = new Date();
          const diffMs = expiryDate.getTime() - now.getTime();
          
          console.log("⏰ Time difference (ms):", diffMs);
          
          if (diffMs <= 0) {
            setIsExpired(true);
            setTimeRemaining(t.expired);
          } else {
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (diffDays > 0) {
              setTimeRemaining(`${diffDays} ${t.daysRemaining}`);
            } else {
              setTimeRemaining(`${diffHours} ${t.hoursRemaining}`);
            }
            setIsExpired(false);
            console.log("✅ Time remaining set:", diffDays, "days", diffHours, "hours");
          }
        } else {
          console.log("❌ No valid subscription data");
          setIsLoggedIn(false);
          setTimeRemaining(null);
        }
      } catch (error) {
        console.error("❌ Error checking subscription:", error);
        setIsLoggedIn(false);
        setTimeRemaining(null);
      }
    };

    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    
    const handleStorageChange = () => {
      checkSubscription();
    };
    
    const handleUserLogin = () => {
      checkSubscription();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, [t]);

  return (
    <nav className="bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-xl border-b border-gray-200/50 backdrop-blur-sm relative z-[50]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="px-4 md:px-12 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Mobile Hamburger Button - في البداية على الموبايل */}
          {!isLoggedIn && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 order-first"
            >
              <div className="flex flex-col gap-1.5">
                <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          )}

          {/* أزرار اللغة - في البداية بعد زر القائمة */}
          <div className="flex gap-1 md:gap-2 bg-white/80 backdrop-blur-sm p-1 md:p-1.5 rounded-full shadow-md border border-gray-200">
            <button 
              onClick={() => setLang("nl")} 
              className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full font-bold transition-all text-xs md:text-sm ${
                lang === "nl" 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-orange-500"
              }`}
            >
              NL
            </button>
            <button 
              onClick={() => setLang("fr")} 
              className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full font-bold transition-all text-xs md:text-sm ${
                lang === "fr" 
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-500"
              }`}
            >
              FR
            </button>
            <button 
              onClick={() => setLang("ar")} 
              className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full font-bold transition-all text-xs md:text-sm ${
                lang === "ar" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-green-500"
              }`}
            >
              AR
            </button>
          </div>

          {/* القائمة الرئيسية - تظهر فقط قبل تسجيل الدخول على Desktop */}
          {!isLoggedIn && (
            <ul className="hidden lg:flex items-center gap-6 text-gray-700 font-semibold text-lg">
              <li>
                <button 
                  onClick={() => window.location.href = "/"} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 transition-all hover:shadow-md group"
                >
                  <FaHome className="group-hover:scale-110 transition-transform" /> 
                  {t.home}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onTheorieClick ? onTheorieClick() : window.location.href = "/theorie"} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all hover:shadow-md group"
                >
                  <FaBook className="group-hover:scale-110 transition-transform" /> 
                  {t.theorie}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.location.href = "/praktical"} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all hover:shadow-md group"
                >
                  <FaCar className="group-hover:scale-110 transition-transform" /> 
                  {t.praktical}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.location.href = "/examen"} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all hover:shadow-md group"
                >
                  <FaCheckCircle className="group-hover:scale-110 transition-transform" /> 
                  {t.examen}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.location.href = "/contact"} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-yellow-600 transition-all hover:shadow-md group"
                >
                  <FaEnvelope className="group-hover:scale-110 transition-transform" /> 
                  {t.contact}
                </button>
              </li>

              <li>
                <button 
                  type="button"
                  onClick={() => {
                    if (onOpenLogin) {
                      onOpenLogin();
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-2xl active:scale-95 hover:scale-110 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <FaSignInAlt className="text-xl relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">{lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : "Login"}</span>
                </button>
              </li>
            </ul>
          )}

          {/* معلومات المستخدم - تظهر بعد تسجيل الدخول */}
          {isLoggedIn && (userName || timeRemaining) && (
            <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center mx-2 md:mx-4 flex-wrap">
              <button
                onClick={() => {
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("userCategory");
                  localStorage.removeItem("userExpiry");
                  window.location.href = "/";
                }}
                className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold group text-xs md:text-sm"
              >
                <FaHome className="text-sm md:text-lg group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">
                  {lang === "ar" ? "القائمة الرئيسية" : lang === "nl" ? "Hoofdmenu" : "Menu Principal"}
                </span>
                <span className="sm:hidden">
                  {lang === "ar" ? "القائمة" : lang === "nl" ? "Menu" : "Menu"}
                </span>
              </button>

              {userName && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs md:text-sm">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold truncate max-w-[80px] md:max-w-none">{userName}</span>
                </div>
              )}
              
              {timeRemaining && (
                <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs md:text-sm ${
                  isExpired 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}>
                  <FaClock className="text-sm md:text-lg" />
                  <span className="font-bold whitespace-nowrap">
                    {isExpired ? t.expired : timeRemaining}
                  </span>
                </div>
              )}

              <button
                onClick={() => window.location.href = "/results"}
                className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group text-xs md:text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold hidden sm:inline">
                  {lang === "ar" ? "النتائج" : lang === "nl" ? "Resultaten" : "Résultats"}
                </span>
                <span className="font-bold sm:hidden">
                  {lang === "ar" ? "نتائج" : lang === "nl" ? "Result" : "Résult"}
                </span>
              </button>
            </div>
          )}

          {/* Logo - في النهاية */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white p-1.5 md:p-2 rounded-2xl shadow-md group-hover:shadow-xl transition-all">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={60} 
                  height={60} 
                  className="cursor-pointer transition-transform group-hover:scale-110 md:w-[80px] md:h-[80px]" 
                  onClick={() => window.location.href = "/"} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!isLoggedIn && isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slideDown">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  window.location.href = "/";
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <FaHome className="text-xl" /> 
                <span>{t.home}</span>
              </button>

              <button 
                onClick={() => {
                  onTheorieClick ? onTheorieClick() : window.location.href = "/theorie";
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <FaBook className="text-xl" /> 
                <span>{t.theorie}</span>
              </button>

              <button 
                onClick={() => {
                  window.location.href = "/praktical";
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <FaCar className="text-xl" /> 
                <span>{t.praktical}</span>
              </button>

              <button 
                onClick={() => {
                  window.location.href = "/examen";
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <FaCheckCircle className="text-xl" /> 
                <span>{t.examen}</span>
              </button>

              <button 
                onClick={() => {
                  window.location.href = "/contact";
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-600 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <FaEnvelope className="text-xl" /> 
                <span>{t.contact}</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (onOpenLogin) {
                    onOpenLogin();
                  } else {
                    setShowLoginModal(true);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <FaSignInAlt className="text-xl" />
                <span>{lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : "Login"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showLoginModal && <LoginModal lang={lang} onClose={() => setShowLoginModal(false)} />}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}
