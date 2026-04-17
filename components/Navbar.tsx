"use client";

import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import { FaHome, FaBook, FaCar, FaCheckCircle, FaEnvelope, FaSignInAlt, FaMobileAlt, FaTimes } from "react-icons/fa";

interface NavbarProps {
  onOpenLogin?: () => void;
  onTheorieClick?: () => void;
}

// ── PWA Install Guide Modal ──────────────────────────────────────────────────
const PWA_TEXT: Record<string, {
  title: string; subtitle: string; or: string; tip: string;
  android: string; iphone: string;
  steps: { android: { icon: string; title: string; desc: string }[]; iphone: { icon: string; title: string; desc: string }[] };
}> = {
  nl: {
    title: "📲 Installeer de app op je telefoon",
    subtitle: "Gratis • Geen App Store nodig • Werkt offline",
    or: "OF",
    tip: "💡 Na installatie werkt de app als een gewone app op je telefoon!",
    android: "Android (Chrome)",
    iphone: "iPhone (Safari)",
    steps: {
      android: [
        { icon: "🌐", title: "Open Chrome", desc: "Open onze website in de Chrome-browser op je Android-telefoon" },
        { icon: "⋮", title: "Tik op het menu", desc: "Tik op de drie puntjes ⋮ rechtsboven in Chrome" },
        { icon: "📲", title: "Toevoegen aan startscherm", desc: 'Kies "Toevoegen aan startscherm" of "App installeren"' },
        { icon: "✅", title: "Bevestig installatie", desc: "Tik op Installeren en de app verschijnt op je startscherm" },
      ],
      iphone: [
        { icon: "🌐", title: "Open Safari", desc: "Open onze website in Safari op iPhone (niet Chrome)" },
        { icon: "⬆️", title: "Deelknop", desc: "Tik op de deelknop ⬆️ onderaan het scherm" },
        { icon: "➕", title: "Toevoegen aan startscherm", desc: 'Scroll naar beneden en kies "Toevoegen aan startscherm"' },
        { icon: "✅", title: "Bevestigen", desc: 'Tik op "Voeg toe" en de app verschijnt op je startscherm' },
      ],
    },
  },
  fr: {
    title: "📲 Installer l'app sur votre téléphone",
    subtitle: "Gratuit • Sans App Store • Fonctionne hors ligne",
    or: "OU",
    tip: "💡 Après installation, l'app fonctionne comme une vraie application!",
    android: "Android (Chrome)",
    iphone: "iPhone (Safari)",
    steps: {
      android: [
        { icon: "🌐", title: "Ouvrir Chrome", desc: "Ouvrez notre site dans Chrome sur votre téléphone Android" },
        { icon: "⋮", title: "Appuyer sur le menu", desc: "Appuyez sur les trois points ⋮ en haut à droite de Chrome" },
        { icon: "📲", title: "Ajouter à l'écran d'accueil", desc: 'Choisissez "Ajouter à l\'écran d\'accueil" ou "Installer l\'app"' },
        { icon: "✅", title: "Confirmer l'installation", desc: "Appuyez sur Installer et l'app apparaîtra sur votre écran" },
      ],
      iphone: [
        { icon: "🌐", title: "Ouvrir Safari", desc: "Ouvrez notre site dans Safari sur iPhone (pas Chrome)" },
        { icon: "⬆️", title: "Bouton Partager", desc: "Appuyez sur le bouton Partager ⬆️ en bas de l'écran" },
        { icon: "➕", title: "Ajouter à l'écran d'accueil", desc: 'Faites défiler et choisissez "Ajouter à l\'écran d\'accueil"' },
        { icon: "✅", title: "Confirmer", desc: 'Appuyez sur "Ajouter" et l\'app apparaîtra sur votre écran' },
      ],
    },
  },
  ar: {
    title: "📲 ثبّت التطبيق على هاتفك",
    subtitle: "مجاناً • بدون متجر تطبيقات • يعمل بدون إنترنت",
    or: "أو",
    tip: "💡 بعد التثبيت يعمل التطبيق مثل أي تطبيق عادي على هاتفك!",
    android: "أندرويد (Chrome)",
    iphone: "آيفون (Safari)",
    steps: {
      android: [
        { icon: "🌐", title: "افتح المتصفح", desc: "افتح موقعنا في متصفح Chrome على هاتفك الأندرويد" },
        { icon: "⋮", title: "اضغط على القائمة", desc: "اضغط على النقاط الثلاث ⋮ في أعلى يمين المتصفح" },
        { icon: "📲", title: "إضافة للشاشة الرئيسية", desc: 'اختر "إضافة إلى الشاشة الرئيسية" أو "Install App"' },
        { icon: "✅", title: "تأكيد التثبيت", desc: "اضغط على تثبيت وسيظهر التطبيق على شاشتك الرئيسية" },
      ],
      iphone: [
        { icon: "🌐", title: "افتح Safari", desc: "افتح موقعنا في متصفح Safari على iPhone (ليس Chrome)" },
        { icon: "⬆️", title: "زر المشاركة", desc: "اضغط على زر المشاركة ⬆️ في أسفل الشاشة" },
        { icon: "➕", title: "إضافة للشاشة الرئيسية", desc: 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية"' },
        { icon: "✅", title: "تأكيد", desc: 'اضغط "إضافة" وسيظهر التطبيق على شاشتك الرئيسية' },
      ],
    },
  },
  en: {
    title: "📲 Install the App on Your Phone",
    subtitle: "Free • No App Store needed • Works offline",
    or: "OR",
    tip: "💡 After installing, the app works just like a native app on your phone!",
    android: "Android (Chrome)",
    iphone: "iPhone (Safari)",
    steps: {
      android: [
        { icon: "🌐", title: "Open Chrome", desc: "Open our website in Chrome browser on your Android phone" },
        { icon: "⋮", title: "Tap the menu", desc: "Tap the three dots ⋮ in the top right of Chrome" },
        { icon: "📲", title: "Add to Home Screen", desc: 'Choose "Add to Home Screen" or "Install App"' },
        { icon: "✅", title: "Confirm install", desc: "Tap Install and the app will appear on your home screen" },
      ],
      iphone: [
        { icon: "🌐", title: "Open Safari", desc: "Open our website in Safari on iPhone (not Chrome)" },
        { icon: "⬆️", title: "Share button", desc: "Tap the Share button ⬆️ at the bottom of the screen" },
        { icon: "➕", title: "Add to Home Screen", desc: 'Scroll down and choose "Add to Home Screen"' },
        { icon: "✅", title: "Confirm", desc: 'Tap "Add" and the app will appear on your home screen' },
      ],
    },
  },
};

function PWAModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const tx = PWA_TEXT[lang] || PWA_TEXT.nl;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const steps = tx.steps;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2d5e 100%)" }}
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center"
          style={{ background: "linear-gradient(135deg, #0066cc, #004499)" }}>
          <button onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors p-1">
            <FaTimes size={18} />
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <FaMobileAlt size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-white font-black text-xl">
            {tx.title}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {tx.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5 pb-6 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Android */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤖</span>
              <span className="text-white font-black text-base">
                {tx.android}
              </span>
            </div>
            <div className="space-y-2">
              {steps.android.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                    style={{ background: "linear-gradient(135deg, #0066cc, #004499)", color: "white" }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.icon} {s.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs font-bold">
              {tx.or}
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* iPhone */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍎</span>
              <span className="text-white font-black text-base">
                {tx.iphone}
              </span>
            </div>
            <div className="space-y-2">
              {steps.iphone.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                    style={{ background: "linear-gradient(135deg, #555, #333)", color: "white" }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.icon} {s.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 rounded-xl text-center"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <p className="text-green-400 text-xs font-bold">
              {tx.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({ onOpenLogin, onTheorieClick }: NavbarProps) {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const pathname = usePathname();

  const changeLang = (code: string) => {
    setLang(code as any);
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
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [userCategory, setUserCategory] = useState<string | null>(null);

  // PWA install prompt listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      // Native prompt available (Android Chrome)
      installPrompt.prompt();
      await installPrompt.userChoice;
      setShowPWAModal(false);
    } else {
      // Show manual guide (iPhone / other)
      setShowPWAModal(true);
    }
  };

  useEffect(() => {
    const check = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setIsLoggedIn(false);
        setDaysLeft(null);
        setUserCategory(null);
        return;
      }
      setIsLoggedIn(true);
      setUserCategory(localStorage.getItem("userCategory"));

      try {
        const sessionToken = localStorage.getItem("sessionToken") || undefined;
        const res = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, sessionToken }),
        });
        const data = await res.json();

        if (data.sessionInvalid) {
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userCategory");
          localStorage.removeItem("userExpiry");
          localStorage.removeItem("sessionToken");
          setIsLoggedIn(false);
          setDaysLeft(null);
          setUserCategory(null);
          window.location.href = "/";
          return;
        }

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
    const interval = setInterval(check, 60 * 60 * 1000);
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
    ...(userCategory !== "A" ? [{ label: t.praktical, href: "/praktical", icon: <FaCar /> }] : []),
    ...(!isLoggedIn ? [{ label: "Gratis", href: "/gratis", icon: <FaCheckCircle /> }] : []),
    { label: t.contact, href: "/contact", icon: <FaEnvelope /> },
  ];

  return (
    <>
      <header dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* الشريط العلوي - أزرق */}
        <div className="bg-[#0066cc] text-white">
          <div className="max-w-5xl mx-auto px-3 py-2 flex items-center justify-between">
            {/* اللوغو + اسم الموقع */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
              <span className="text-base md:text-2xl font-black tracking-wide uppercase hidden sm:inline">
                Sewar Rijbewijsonline
              </span>
              <span className="text-base font-black tracking-wide uppercase sm:hidden">
                Sewar Rijbewijsonline
              </span>
            </div>

            {/* أزرار اللغة + PWA + Inloggen */}
            <div className="flex flex-col items-end gap-1">
              {/* صف: أزرار اللغة + زر التلفون */}
              <div className="flex gap-1 items-center">
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

              {/* زر Inloggen */}
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
                    onClick={() => {
                      localStorage.removeItem("userEmail");
                      localStorage.removeItem("userCategory");
                      localStorage.removeItem("userExpiry");
                      window.location.href = "/";
                    }}
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
                        isActive ? "bg-white text-[#0066cc]" : "hover:bg-[#0066cc] text-white"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </button>
                  </li>
                );
              })}
              {/* زر تحميل التطبيق - بجانب Contact */}
              <li>
                <button
                  onClick={() => setShowPWAModal(true)}
                  className="relative flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "white",
                  }}
                >
                  <FaMobileAlt size={14} />
                  {lang === "ar" ? "تطبيق" : lang === "nl" ? "App" : lang === "fr" ? "App" : "App"}
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400" />
                </button>
              </li>
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
                {/* زر تحميل التطبيق في Mobile */}
                <button
                  onClick={() => { setShowPWAModal(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 font-bold text-sm uppercase border-t border-white/20 transition-colors text-left"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white" }}
                >
                  <FaMobileAlt size={14} />
                  {lang === "ar" ? "📲 تحميل التطبيق" : lang === "nl" ? "📲 App installeren" : lang === "fr" ? "📲 Installer l'app" : "📲 Install App"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {showLoginModal && <LoginModal lang={lang} onClose={() => setShowLoginModal(false)} />}
      {showPWAModal && <PWAModal lang={lang} onClose={() => setShowPWAModal(false)} />}
    </>
  );
}
