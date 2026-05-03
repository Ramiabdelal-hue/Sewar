"use client";

import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useEffect, useState, useRef } from "react";
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
  const [selected, setSelected] = useState<"android" | "iphone" | null>(null);

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
          <h2 className="text-white font-black text-xl">{tx.title}</h2>
          <p className="text-white/70 text-sm mt-1">{tx.subtitle}</p>
        </div>

        <div className="px-6 pt-5 pb-6 overflow-y-auto max-h-[70vh]">

          {/* اختيار الجهاز */}
          {!selected ? (
            <div className="space-y-4">
              <p className="text-white/60 text-sm text-center mb-5">
                {lang === "ar" ? "اختر نوع جهازك" : lang === "nl" ? "Kies je apparaat" : lang === "fr" ? "Choisissez votre appareil" : "Choose your device"}
              </p>

              {/* زر Android */}
              <button
                onClick={() => setSelected("android")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(135deg, #22c55e22, #16a34a22)", border: "1.5px solid rgba(34,197,94,0.4)" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  🤖
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-lg">Android</p>
                  <p className="text-white/50 text-xs mt-0.5">Chrome Browser</p>
                </div>
                <span className="ml-auto text-white/40 text-xl">›</span>
              </button>

              {/* زر iPhone */}
              <button
                onClick={() => setSelected("iphone")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f122, #4f46e522)", border: "1.5px solid rgba(99,102,241,0.4)" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  🍎
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-lg">iPhone</p>
                  <p className="text-white/50 text-xs mt-0.5">Safari Browser</p>
                </div>
                <span className="ml-auto text-white/40 text-xl">›</span>
              </button>

              {/* Tip */}
              <div className="p-3 rounded-xl text-center mt-4"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-green-400 text-xs font-bold">{tx.tip}</p>
              </div>
            </div>

          ) : (
            /* خطوات التثبيت */
            <div>
              {/* زر الرجوع */}
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-bold mb-4 transition-colors"
              >
                ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
              </button>

              {/* عنوان الجهاز */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selected === "android" ? "🤖" : "🍎"}</span>
                <span className="text-white font-black text-lg">
                  {selected === "android" ? tx.android : tx.iphone}
                </span>
              </div>

              {/* الخطوات */}
              <div className="space-y-2">
                {tx.steps[selected].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                      style={{
                        background: selected === "android"
                          ? "linear-gradient(135deg, #22c55e, #16a34a)"
                          : "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "white"
                      }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{s.icon} {s.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="p-3 rounded-xl text-center mt-4"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-green-400 text-xs font-bold">{tx.tip}</p>
              </div>
            </div>
          )}
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
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [userCategory, setUserCategory] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [screenshotWarning, setScreenshotWarning] = useState(false);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const checkingRef = useRef(false);
  const hasCheckedRef = useRef(false); // منع التشغيل عند mount مرتين (StrictMode)

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
    // منع التشغيل مرتين في React StrictMode
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const check = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setIsLoggedIn(false);
          setDaysLeft(null);
          setUserCategory(null);
          setUserName(null);
          return;
        }
        setIsLoggedIn(true);
        setUserCategory(localStorage.getItem("userCategory"));
        setUserName(localStorage.getItem("userName"));

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
          localStorage.removeItem("userName");
          setIsLoggedIn(false);
          setDaysLeft(null);
          setUserCategory(null);
          setUserName(null);
          window.location.href = "/";
          return;
        }

        if (data.suspended) {
          setIsSuspended(true);
          return;
        }
        setIsSuspended(false);

        if (data.success && data.user?.expiryDate) {
          if (data.user.name) {
            localStorage.setItem("userName", data.user.name);
            setUserName(data.user.name);
          }

          const attempts = data.screenshotAttempts || 0;
          if (attempts > 3) {
            setScreenshotWarning(true);
            setScreenshotCount(attempts);
          }

          let earliestExpiry = new Date(data.user.expiryDate).getTime();
          if (data.subscriptions && data.subscriptions.length > 0) {
            for (const sub of data.subscriptions) {
              const subExpiry = new Date(sub.expiryDate).getTime();
              if (subExpiry < earliestExpiry) earliestExpiry = subExpiry;
            }
          }

          const diff = earliestExpiry - Date.now();
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
      } finally {
        checkingRef.current = false;
      }
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000);

    const onLogin = () => {
      hasCheckedRef.current = false;
      check();
    };
    window.addEventListener("userLoggedIn", onLogin);

    return () => {
      clearInterval(interval);
      window.removeEventListener("userLoggedIn", onLogin);
    };
  }, []);

  const navLinks = [
    { label: t.home, href: "/", icon: <FaHome /> },
    { label: t.theorie, href: "/theorie", icon: <FaBook />, onClick: onTheorieClick },
    // HIDDEN TEMPORARILY: praktijk
    // ...(userCategory !== "A" ? [{ label: t.praktical, href: "/praktical", icon: <FaCar /> }] : []),
    ...(!isLoggedIn ? [{ label: t.gratis, href: "/gratis", icon: <FaCheckCircle /> }] : []),
    { label: t.contact, href: "/contact", icon: <FaEnvelope /> },
  ];

  return (
    <>
      <header dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* الشريط العلوي - أبيض */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
          <div className="max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between gap-4">
            {/* اسم الموقع - ألوان العلم البلجيكي */}
            <div className="cursor-pointer" onClick={() => window.location.href = "/"}>
              <span className="text-sm md:text-2xl font-black tracking-wide uppercase whitespace-nowrap">
                <span style={{ color: '#1a1a1a' }}>SEWAR </span>
                <span style={{ color: '#f5a623' }}>RIJBEWIJS</span>
                <span style={{ color: '#e63946' }}>ONLINE</span>
              </span>
            </div>

            {/* اليمين: أزرار اللغة + Inloggen */}
            <div className="flex flex-col items-end gap-1.5">
              {/* أزرار اللغة */}
              <div className="flex gap-1">
                {[{ code: "nl", label: "NL" }, { code: "fr", label: "FR" }, { code: "ar", label: "AR" }, { code: "en", label: "EN" }].map(({ code, label }) => (
                  <button key={code} onClick={() => changeLang(code)}
                    className="px-2.5 py-1 font-bold text-xs rounded-md transition-all"
                    style={lang === code
                      ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "white" }
                      : { background: "#f3f4f6", color: "#6b7280" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* زر Inloggen / Logout */}
              {!isLoggedIn ? (
                <button onClick={() => onOpenLogin ? onOpenLogin() : setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-wide transition-all active:scale-95 text-white w-full justify-center"
                  style={{ background: "linear-gradient(135deg,#f5a623,#e8920a)" }}>
                  <FaSignInAlt size={10} />
                  {lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
                </button>
              ) : (
                <div className="flex flex-col gap-0.5 items-end">
                  <button onClick={() => { localStorage.removeItem("userEmail"); localStorage.removeItem("userCategory"); localStorage.removeItem("userExpiry"); localStorage.removeItem("userName"); window.location.href = "/"; }}
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase bg-red-500 hover:bg-red-600 text-white">
                    {lang === "ar" ? "خروج" : lang === "nl" ? "Logout" : lang === "fr" ? "Déconnexion" : "Logout"}
                  </button>
                  <div className="text-right text-gray-600 text-xs">
                    {lang === "ar" ? "أهلاً" : lang === "nl" ? "Welkom" : lang === "fr" ? "Bienvenue" : "Welcome"}{userName && `, ${userName}`}
                    {daysLeft !== null && (
                      <span className={`ml-1 font-bold ${isExpired ? "text-red-500" : daysLeft <= 3 ? "text-orange-500" : "text-green-600"}`}>
                        {isExpired ? (lang === "ar" ? "منتهي" : "Verlopen") : `${daysLeft}d`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الشريط الثاني - أبيض مع أيقونات */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="max-w-5xl mx-auto px-2">
            {/* Desktop */}
            <ul className="hidden md:flex items-center">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <li key={i}>
                    <button onClick={() => link.onClick ? link.onClick() : window.location.href = link.href}
                      className="flex flex-col items-center gap-0.5 px-5 py-2.5 font-bold text-[11px] uppercase tracking-wide transition-all border-b-2"
                      style={isActive ? { borderColor: "#7c3aed", color: "#7c3aed" } : { borderColor: "transparent", color: "#9ca3af" }}>
                      <span style={{ fontSize: "16px", color: isActive ? "#7c3aed" : "#9ca3af" }}>{link.icon}</span>
                      {link.label}
                    </button>
                  </li>
                );
              })}
              <li>
                <button onClick={() => setShowPWAModal(true)}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 font-bold text-[11px] uppercase tracking-wide transition-all ml-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white" }}>
                  <FaMobileAlt style={{ fontSize: "16px" }} />
                  App
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/32470813725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-0.5 px-4 py-2 font-bold text-[11px] uppercase tracking-wide transition-all ml-1 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#25d366,#128c7e)", color: "white" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px" }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat
                </a>
              </li>
            </ul>

            {/* Mobile */}
            <div className="md:hidden flex items-center overflow-x-auto scrollbar-hide">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <button key={i} onClick={() => { link.onClick ? link.onClick() : window.location.href = link.href; }}
                    className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 font-bold text-[10px] uppercase whitespace-nowrap flex-shrink-0 border-b-2 transition-all"
                    style={isActive ? { borderColor: "#7c3aed", color: "#7c3aed" } : { borderColor: "transparent", color: "#9ca3af" }}>
                    <span style={{ fontSize: "15px", color: isActive ? "#7c3aed" : "#9ca3af" }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setShowPWAModal(true)}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 font-bold text-[10px] uppercase whitespace-nowrap flex-shrink-0 rounded-xl ml-1"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white" }}>
                <FaMobileAlt style={{ fontSize: "15px" }} />
                <span>App</span>
              </button>
              {/* زر واتساب */}
              <a
                href="https://wa.me/32470813725"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 font-bold text-[10px] uppercase whitespace-nowrap flex-shrink-0 rounded-xl ml-1"
                style={{ background: "linear-gradient(135deg,#25d366,#128c7e)", color: "white" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ fontSize: "15px", width: "15px", height: "15px" }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Chat</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showLoginModal && <LoginModal lang={lang} onClose={() => setShowLoginModal(false)} />}
      {showPWAModal && <PWAModal lang={lang} onClose={() => setShowPWAModal(false)} />}

      {/* ── بانر: حساب معلق ─────────────────────────────────────────────── */}
      {isSuspended && (
        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
          style={{
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            color: "#fff",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            fontWeight: "700",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "22px" }}>🔒</span>
          <span style={{ flex: 1 }}>
            {lang === "ar"
              ? "تم تعليق اشتراكك مؤقتاً من قِبل المشرف. للاستفسار تواصل معنا على sewarrijbewijs@gmail.com"
              : lang === "nl"
              ? "Uw abonnement is tijdelijk opgeschort door de beheerder. Neem contact op via sewarrijbewijs@gmail.com"
              : lang === "fr"
              ? "Votre abonnement a été temporairement suspendu. Contactez-nous à sewarrijbewijs@gmail.com"
              : "Your subscription has been temporarily suspended. Contact us at sewarrijbewijs@gmail.com"}
          </span>
        </div>
      )}

      {/* ── بانر: تحذير Screenshot ──────────────────────────────────────── */}
      {screenshotWarning && !isSuspended && (
        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
          style={{
            background: "linear-gradient(135deg,#dc2626,#b91c1c)",
            color: "#fff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            fontWeight: "700",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <span style={{ flex: 1 }}>
            {lang === "ar"
              ? `تحذير: تم رصد ${screenshotCount} محاولة لأخذ لقطات شاشة على حسابك. تكرار ذلك قد يؤدي إلى تعليق اشتراكك.`
              : lang === "nl"
              ? `Waarschuwing: Er zijn ${screenshotCount} schermafbeeldingspogingen gedetecteerd op uw account. Herhaling kan leiden tot opschorting.`
              : lang === "fr"
              ? `Avertissement: ${screenshotCount} tentatives de capture d'écran détectées. La répétition peut entraîner la suspension.`
              : `Warning: ${screenshotCount} screenshot attempts detected on your account. Repeated attempts may lead to suspension.`}
          </span>
          <button
            onClick={() => setScreenshotWarning(false)}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontWeight: "900", fontSize: "14px" }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
