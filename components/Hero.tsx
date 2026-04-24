"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useLang } from "@/context/LangContext";
import { FaMobileAlt, FaTimes } from "react-icons/fa";

interface HeroProps {
  onSelect: () => void;
}

export default function Hero({ onSelect }: HeroProps) {
  const { lang } = useLang();
  const router = useRouter();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const [showPWA, setShowPWA] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [pwaSelected, setPwaSelected] = useState<"android"|"iphone"|null>(null);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
    } else {
      setShowPWA(true);
    }
  };

  // capture install prompt
  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }

  return (
    <>
    <section
      className="flex flex-col px-3 py-3 overflow-y-auto gap-3"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ height: "100%", background: "#f0f0f0" }}
    >
      {/* الصورة */}
      <div className="relative w-full rounded-2xl overflow-hidden flex-shrink-0"
        style={{ height: "42%", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <Image src="/hero.jpg" alt="Driving lesson" fill
          className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.25))" }} />
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.92)" }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#fbbf24" }} />
          <span className="text-xs font-bold text-white">
            {lang === "ar" ? "متاح الآن" : lang === "nl" ? "Nu beschikbaar" : lang === "fr" ? "Disponible" : "Available now"}
          </span>
        </div>
      </div>

      {/* البطاقة البيضاء */}
      <div className="flex flex-col items-center text-center px-4 py-4 rounded-2xl flex-1"
        style={{ background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

        <div className="mb-2">
          <Image src="/her.jpeg" alt="S & A Rijacademie" width={100} height={100}
            className="rounded-full object-cover"
            style={{ width: '100px', height: '100px', border: "3px solid #f3f4f6" }} />
        </div>

        <p className="text-xs leading-relaxed mb-3 max-w-xl font-medium" style={{ color: "#7c3aed" }}>
          {t.heroText}
        </p>

        <button onClick={() => router.push("/theorie")}
          className="group flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 mb-3 w-full justify-center"
          style={{ background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)", color: "#0a0a0a", boxShadow: "0 4px 16px rgba(212,175,55,0.4)" }}>
          <span>{t.heroButton}</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>

        <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t mt-auto" style={{ borderColor: "#f3f4f6" }}>
          {[
            { icon: "👥", value: "10,000+", label: lang === "ar" ? "طالب" : lang === "nl" ? "Studenten" : lang === "fr" ? "Étudiants" : "Students" },
            { icon: "✅", value: "100%", label: lang === "ar" ? "نجاح" : lang === "nl" ? "Geslaagd" : lang === "fr" ? "Réussite" : "Pass rate" },
            { icon: "🏅", value: "A·B·C", label: lang === "ar" ? "فئات" : lang === "nl" ? "Categorieën" : lang === "fr" ? "Catégories" : "Categories" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl"
              style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
              <span className="text-lg">{stat.icon}</span>
              <div className="text-base font-black" style={{ color: "#7c3aed" }}>{stat.value}</div>
              <div className="text-[10px] font-medium" style={{ color: "#9ca3af" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PWA Modal */}
    {showPWA && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={() => { setShowPWA(false); setPwaSelected(null); }}>
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2d5e 100%)" }}
          onClick={e => e.stopPropagation()}
          dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="relative px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(135deg, #0066cc, #004499)" }}>
            <button onClick={() => { setShowPWA(false); setPwaSelected(null); }}
              className="absolute top-3 right-3 text-white/70 hover:text-white p-1"><FaTimes size={18} /></button>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                <FaMobileAlt size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-white font-black text-xl">
              {lang === "ar" ? "📲 ثبّت التطبيق على هاتفك" : lang === "nl" ? "📲 Installeer de app" : lang === "fr" ? "📲 Installer l'app" : "📲 Install the App"}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {lang === "ar" ? "مجاناً • بدون متجر • يعمل بدون إنترنت" : lang === "nl" ? "Gratis • Geen App Store • Werkt offline" : lang === "fr" ? "Gratuit • Sans App Store • Hors ligne" : "Free • No App Store • Works offline"}
            </p>
          </div>
          <div className="px-6 pt-5 pb-6 overflow-y-auto max-h-[70vh]">
            {!pwaSelected ? (
              <div className="space-y-4">
                <p className="text-white/60 text-sm text-center mb-5">
                  {lang === "ar" ? "اختر نوع جهازك" : lang === "nl" ? "Kies je apparaat" : lang === "fr" ? "Choisissez votre appareil" : "Choose your device"}
                </p>
                <button onClick={() => setPwaSelected("android")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg,#22c55e22,#16a34a22)", border: "1.5px solid rgba(34,197,94,0.4)" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>🤖</div>
                  <div className="text-left"><p className="text-white font-black text-lg">Android</p><p className="text-white/50 text-xs">Chrome Browser</p></div>
                  <span className="ml-auto text-white/40 text-xl">›</span>
                </button>
                <button onClick={() => setPwaSelected("iphone")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg,#6366f122,#4f46e522)", border: "1.5px solid rgba(99,102,241,0.4)" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>🍎</div>
                  <div className="text-left"><p className="text-white font-black text-lg">iPhone</p><p className="text-white/50 text-xs">Safari Browser</p></div>
                  <span className="ml-auto text-white/40 text-xl">›</span>
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setPwaSelected(null)} className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-bold mb-4">
                  ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
                </button>
                <div className="space-y-2">
                  {(pwaSelected === "android" ? [
                    { icon: "🌐", title: "Open Chrome", desc: lang === "nl" ? "Open onze website in Chrome" : lang === "ar" ? "افتح الموقع في Chrome" : "Open our website in Chrome" },
                    { icon: "⋮", title: lang === "nl" ? "Tik op het menu" : lang === "ar" ? "اضغط القائمة" : "Tap the menu", desc: lang === "nl" ? "Tik op de drie puntjes ⋮ rechtsboven" : lang === "ar" ? "اضغط النقاط الثلاث ⋮" : "Tap the three dots ⋮ top right" },
                    { icon: "📲", title: lang === "nl" ? "Toevoegen aan startscherm" : lang === "ar" ? "إضافة للشاشة الرئيسية" : "Add to Home Screen", desc: lang === "nl" ? 'Kies "Toevoegen aan startscherm"' : lang === "ar" ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"' },
                    { icon: "✅", title: lang === "nl" ? "Bevestig" : lang === "ar" ? "تأكيد" : "Confirm", desc: lang === "nl" ? "Tik op Installeren" : lang === "ar" ? "اضغط تثبيت" : "Tap Install" },
                  ] : [
                    { icon: "🌐", title: "Open Safari", desc: lang === "nl" ? "Open onze website in Safari (niet Chrome)" : lang === "ar" ? "افتح الموقع في Safari (ليس Chrome)" : "Open in Safari (not Chrome)" },
                    { icon: "⬆️", title: lang === "nl" ? "Deelknop" : lang === "ar" ? "زر المشاركة" : "Share button", desc: lang === "nl" ? "Tik op de deelknop ⬆️ onderaan" : lang === "ar" ? "اضغط زر المشاركة ⬆️ أسفل الشاشة" : "Tap Share ⬆️ at the bottom" },
                    { icon: "➕", title: lang === "nl" ? "Toevoegen aan startscherm" : lang === "ar" ? "إضافة للشاشة الرئيسية" : "Add to Home Screen", desc: lang === "nl" ? 'Scroll en kies "Toevoegen aan startscherm"' : lang === "ar" ? 'مرر واختر "إضافة إلى الشاشة الرئيسية"' : 'Scroll and choose "Add to Home Screen"' },
                    { icon: "✅", title: lang === "nl" ? "Bevestigen" : lang === "ar" ? "تأكيد" : "Confirm", desc: lang === "nl" ? 'Tik op "Voeg toe"' : lang === "ar" ? 'اضغط "إضافة"' : 'Tap "Add"' },
                  ]).map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
                        style={{ background: pwaSelected === "android" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                        {i + 1}
                      </div>
                      <div><p className="text-white font-bold text-sm">{s.icon} {s.title}</p><p className="text-white/60 text-xs mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
}
