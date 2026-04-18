"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

export default function VideoLessonsPage() {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [praktijkPrices, setPraktijkPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("renewPrefillData");
    if (stored) setPrefillData(JSON.parse(stored));

    const email = localStorage.getItem("userEmail");
    if (email) {
      fetch("/api/check-subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(r => r.json()).then(data => {
        if (data.success && data.subscriptions) {
          const pl = data.subscriptions.find((s: any) => s.subscriptionType === "praktijk-lessons");
          const pe = data.subscriptions.find((s: any) => s.subscriptionType === "praktijk-exam");
          if (pl) window.location.assign(`/praktical/lessons?email=${encodeURIComponent(email)}&exp=${new Date(pl.expiryDate).getTime()}`);
          else if (pe) window.location.assign(`/praktical/exam?email=${encodeURIComponent(email)}&exp=${new Date(pe.expiryDate).getTime()}`);
        }
      }).catch(() => {});
    }

    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.success) setPraktijkPrices(d.settings);
    }).catch(() => {});
  }, []);

  const options = [
    {
      id: "lessons",
      title: t.drivingLessons || "Oefenvideo's",
      desc: t.lessonsDesc || "Volledige uitleg van alle verkeersregels met beeld en geluid",
      price: praktijkPrices["praktijk_B_training"] || praktijkPrices["praktijk_training"] || "49",
      color: "#3b82f6", glow: "rgba(59,130,246,0.2)",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "exam",
      title: t.practicalExam || "Gevaarherkenning",
      desc: t.examDesc || "Praktijkgerichte video-oefeningen om je voor te bereiden op het examen",
      price: praktijkPrices["praktijk_B_hazard"] || praktijkPrices["praktijk_hazard"] || "39",
      color: "#f97316", glow: "rgba(249,115,22,0.2)",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  if (isCheckout && selectedBox) {
    return (
      <CheckoutForm
        selectedData={{ catId: selectedBox, duration: "praktical" }}
        onBack={() => setIsCheckout(false)}
        prefillData={prefillData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 50%, #060818 100%)" }}>

      {/* خلفية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "#3b82f6" }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "#f97316" }}></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 flex-1 px-4 py-8 max-w-lg mx-auto w-full md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            {lang === "ar" ? "اشتراك عملي" : lang === "nl" ? "Praktijk Abonnement" : "Abonnement Pratique"}
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            {t.prakticalTitle || (lang === "ar" ? "اختر نوع التدريب" : lang === "nl" ? "Kies je training" : "Choisissez votre formation")}
          </h1>
          <p className="text-white/40 text-sm">
            {lang === "ar" ? "فيديوهات تدريبية احترافية" : lang === "nl" ? "Professionele trainingsvideo's" : "Vidéos de formation professionnelles"}
          </p>
        </div>

        {/* الكروت */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 mb-6">
          {options.map(opt => {
            const isSelected = selectedBox === opt.id;
            return (
              <div key={opt.id}
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: isSelected ? `${opt.color}15` : "rgba(255,255,255,0.05)",
                  border: isSelected ? `2px solid ${opt.color}60` : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isSelected ? `0 12px 40px ${opt.glow}` : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = `0 20px 50px ${opt.glow}`;
                  el.style.border = `1.5px solid ${opt.color}50`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = isSelected ? `0 12px 40px ${opt.glow}` : "none";
                  el.style.border = isSelected ? `2px solid ${opt.color}60` : "1px solid rgba(255,255,255,0.1)";
                }}
                onClick={() => setSelectedBox(opt.id)}
              >
                {/* رأس الكرت */}
                <div className="flex items-center gap-4 px-5 py-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}30`, color: opt.color }}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-lg">{opt.title}</p>
                    <p className="text-white/50 text-sm mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: opt.color }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* فاصل */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 20px" }}></div>

                {/* السعر + زر */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-0.5">
                      {lang === "ar" ? "السعر" : lang === "nl" ? "Prijs" : "Prix"}
                    </p>
                    <p className="text-3xl font-black" style={{ color: opt.color }}>€{opt.price}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedBox(opt.id); setIsCheckout(true); }}
                    className="px-5 py-3 rounded-xl font-black text-sm transition-all active:scale-95 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${opt.color}, ${opt.color}cc)`,
                      color: "white",
                      boxShadow: `0 4px 16px ${opt.color}40`,
                    }}>
                    {lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* مميزات */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: "🎬", label: lang === "ar" ? "فيديوهات HD" : "HD Video's" },
            { icon: "🚗", label: lang === "ar" ? "تدريب عملي" : "Praktijktraining" },
            { icon: "🏆", label: lang === "ar" ? "نجاح مضمون" : "Slaag gegarandeerd" },
          ].map((f, i) => (
            <div key={i} className="text-center py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-white/50 text-[10px] font-bold">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
