"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

export default function TheoriePage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [globalSelection, setGlobalSelection] = useState<{ catId: string; duration: string; catName: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPrices, setAllPrices] = useState<Record<string, string>>({});
  const [examModal, setExamModal] = useState<{lessonId: number; lessonTitle: string; batches: {from:number;count:number}[]} | null>(null);
  const [loadingExam, setLoadingExam] = useState(false);

  const translatedTitles = useAutoTranslateList(lessons.map(l => l.title), lang);

  const categories = [
    { id: "A", name: t.categoryA || "Rijbewijs A", desc: t.motorcycles || "Motorfietsen", icon: <MotorcycleIcon className="w-14 h-9" />, color: "#f97316", glow: "rgba(249,115,22,0.2)" },
    { id: "B", name: t.categoryB || "Rijbewijs B", desc: t.cars || "Auto's",              icon: <CarIcon className="w-14 h-9" />,        color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
    { id: "C", name: t.categoryC || "Rijbewijs C", desc: t.trucks || "Vrachtwagens",      icon: <TruckIcon className="w-14 h-9" />,      color: "#22c55e", glow: "rgba(34,197,94,0.2)" },
  ];

  const getDurations = (catId: string) => [
    { key: "2w", label: t.twoWeeks || "2 Weken", price: allPrices[`theorie_${catId}_2w`] || "25" },
    { key: "1m", label: t.oneMonth || "1 Maand", price: allPrices[`theorie_${catId}_1m`] || "50" },
  ];

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => { if (d.success) setAllPrices(d.settings); }).catch(() => {});
    const email = localStorage.getItem("userEmail");
    const category = localStorage.getItem("userCategory");
    if (email && category) {
      setUserEmail(email); setUserCategory(category); setIsLoggedIn(true);
      checkAndFetch(email, category);
    } else { setLoading(false); }
  }, []);

  const openExamModal = async (lessonId: number, lessonTitle: string) => {
    setLoadingExam(true);
    try {
      const res = await fetch(`/api/exam-questions?lessonId=${lessonId}&category=${userCategory}`);
      const data = await res.json();
      const total = data.success ? (data.questions?.length || 0) : 0;
      if (total === 0) {
        router.push(`/examen/category?cat=${userCategory}&email=${userEmail}&lessonId=${lessonId}`);
        return;
      }
      const batches: {from:number;count:number}[] = [];
      for (let i = 0; i < total; i += 50) {
        batches.push({ from: i, count: Math.min(50, total - i) });
      }
      setExamModal({ lessonId, lessonTitle, batches });
    } catch {
      router.push(`/examen/category?cat=${userCategory}&email=${userEmail}&lessonId=${lessonId}`);
    } finally {
      setLoadingExam(false);
    }
  };

  const checkAndFetch = async (email: string, category: string) => {
    try {
      // ✅ Parallel requests - جلب check-subscription والدروس في نفس الوقت
      const [subResult, lessonsResult] = await Promise.allSettled([
        Promise.race([
          fetch("/api/check-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000)),
        ]),
        fetch(`/api/lessons?category=${category}`),
      ]);

      // معالجة check-subscription
      if (subResult.status === "fulfilled" && subResult.value) {
        try {
          const subData = await (subResult.value as Response).json();
          if (subData.expired) { setIsExpired(true); setLoading(false); return; }
        } catch {}
      }

      // معالجة الدروس
      if (lessonsResult.status === "fulfilled") {
        try {
          const ld = await (lessonsResult.value as Response).json();
          if (ld.success) setLessons(ld.lessons);
        } catch {}
      }
    } catch {
      try {
        const lr = await fetch(`/api/lessons?category=${category}`);
        const ld = await lr.json();
        if (ld.success) setLessons(ld.lessons);
      } catch {}
    } finally { setLoading(false); }
  };

  if (showCheckout && globalSelection) {
    return <CheckoutForm selectedData={globalSelection} onBack={() => setShowCheckout(false)} />;
  }

  // ─── شاشة الاشتراك ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}
        style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #0d1b3e 50%, #0a0a1a 100%)" }}>

        <Navbar />

        <div className="relative z-10 flex-1 px-4 py-8 max-w-lg mx-auto w-full md:max-w-3xl">

          {/* ── Hero Header ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-black uppercase tracking-widest"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }}></span>
              {lang === "ar" ? "🎓 منصة تعليم رخصة القيادة" : lang === "nl" ? "🎓 Rijbewijs Leerplatform" : lang === "fr" ? "🎓 Plateforme d'apprentissage" : "🎓 Driving Theory Platform"}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight"
              style={{ color: "#ffffff", textShadow: "0 0 40px rgba(124,58,237,0.5)" }}>
              {lang === "ar" ? "احصل على رخصتك" : lang === "nl" ? "Haal je rijbewijs" : lang === "fr" ? "Obtenez votre permis" : "Get your license"}
              <span style={{ color: "#d4af37" }}> {lang === "ar" ? "من أول مرة" : lang === "nl" ? "in één keer" : lang === "fr" ? "du premier coup" : "first time"}</span>
            </h1>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              {lang === "ar" ? "دروس شاملة + أسئلة تدريبية + امتحانات محاكاة" : lang === "nl" ? "Volledige lessen + oefenvragen + simulatie-examens" : lang === "fr" ? "Leçons complètes + questions d'entraînement + examens" : "Full lessons + practice questions + simulation exams"}
            </p>
          </div>

          {/* ── مميزات سريعة ── */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "📚", label: lang === "ar" ? "دروس كاملة" : lang === "nl" ? "Alle lessen" : lang === "fr" ? "Toutes les leçons" : "All lessons", sub: lang === "ar" ? "نظري شامل" : lang === "nl" ? "Volledig" : lang === "fr" ? "Complet" : "Complete" },
              { icon: "🎯", label: lang === "ar" ? "امتحانات" : lang === "nl" ? "Examens" : lang === "fr" ? "Examens" : "Exams", sub: lang === "ar" ? "محاكاة حقيقية" : lang === "nl" ? "Simulatie" : lang === "fr" ? "Simulation" : "Simulation" },
              { icon: "🔊", label: lang === "ar" ? "صوت" : lang === "nl" ? "Audio" : lang === "fr" ? "Audio" : "Audio", sub: lang === "ar" ? "قراءة تلقائية" : lang === "nl" ? "Automatisch" : lang === "fr" ? "Automatique" : "Automatic" },
            ].map((f, i) => (
              <div key={i} className="text-center py-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-white text-xs font-black">{f.label}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{f.sub}</p>
              </div>
            ))}
          </div>

          {/* ── كروت الفئات ── */}
          <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 mb-6">
            {categories.map(cat => {
              const durations = getDurations(cat.id);
              const isSelected = globalSelection?.catId === cat.id;
              return (
                <div key={cat.id}
                  className="rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.2))"
                      : "rgba(255,255,255,0.04)",
                    border: isSelected ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: isSelected ? "0 0 40px rgba(124,58,237,0.3)" : "none",
                  }}>

                  {/* رأس الكرت */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}>
                      <div style={{ color: cat.color }}>{cat.icon}</div>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white text-base">{cat.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{cat.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#7c3aed" }}>
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* زر Gratis */}
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => router.push(`/gratis?cat=${cat.id}`)}
                      className="w-full py-2 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
                      🎁 {lang === "ar" ? "جرب مجاناً" : lang === "nl" ? "Gratis proberen" : lang === "fr" ? "Essayer gratuitement" : "Try for free"}
                    </button>
                  </div>

                  {/* أزرار المدة */}
                  <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                    {durations.map(dur => {
                      const active = isSelected && globalSelection?.duration === dur.key;
                      return (
                        <button key={dur.key}
                          onClick={() => setGlobalSelection({ catId: cat.id, duration: dur.key, catName: cat.name })}
                          className="py-3 rounded-xl transition-all active:scale-95 relative overflow-hidden"
                          style={{
                            background: active ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.06)",
                            border: active ? "1.5px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: active ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                          }}>
                          {active && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/60"></div>}
                          <p className="text-xs font-bold mb-0.5" style={{ color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}>{dur.label}</p>
                          <p className="text-xl font-black" style={{ color: active ? "white" : "rgba(255,255,255,0.8)" }}>€{dur.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── زر الاشتراك ── */}
          <button
            onClick={() => globalSelection && setShowCheckout(true)}
            disabled={!globalSelection}
            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 disabled:opacity-30 mb-8"
            style={{
              background: globalSelection ? "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)" : "rgba(255,255,255,0.1)",
              color: globalSelection ? "#0a0a0a" : "rgba(255,255,255,0.3)",
              boxShadow: globalSelection ? "0 8px 30px rgba(212,175,55,0.4)" : "none",
            }}>
            {globalSelection
              ? `🔓 ${lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Nu inschrijven" : "S'inscrire maintenant"} — €${getDurations(globalSelection.catId).find(d => d.key === globalSelection.duration)?.price}`
              : (lang === "ar" ? "اختر فئة ومدة أولاً" : lang === "nl" ? "Kies een categorie en duur" : "Choisissez une catégorie")}
          </button>

          {/* ── طرق الدفع ── */}
          <div className="rounded-3xl overflow-hidden mb-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-white/60 text-xs font-black uppercase tracking-widest text-center">
                🔒 {lang === "ar" ? "طرق الدفع الآمنة" : lang === "nl" ? "Veilige betaalmethoden" : lang === "fr" ? "Méthodes de paiement sécurisées" : "Secure payment methods"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-8 h-8">
                      <rect width="48" height="48" rx="8" fill="#005498"/>
                      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="900">BANC</text>
                      <text x="24" y="40" textAnchor="middle" fill="#f5a623" fontSize="8" fontWeight="700">CONTACT</text>
                    </svg>
                  ),
                  label: "Bancontact",
                  sub: lang === "ar" ? "بلجيكا" : "België",
                  color: "#005498",
                },
                {
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-8 h-8">
                      <rect width="48" height="48" rx="8" fill="#1a1f71"/>
                      <text x="24" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="900">VISA</text>
                      <rect x="8" y="26" width="32" height="3" rx="1.5" fill="#f7b731"/>
                      <text x="24" y="38" textAnchor="middle" fill="white" fontSize="7">Mastercard</text>
                    </svg>
                  ),
                  label: "Visa / MC",
                  sub: lang === "ar" ? "بطاقة" : "Kaart",
                  color: "#1a1f71",
                },
                {
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-8 h-8">
                      <rect width="48" height="48" rx="8" fill="#f59e0b"/>
                      <rect x="10" y="14" width="28" height="20" rx="3" fill="white" opacity="0.9"/>
                      <rect x="10" y="20" width="28" height="4" fill="#f59e0b"/>
                      <circle cx="24" cy="34" r="3" fill="#f59e0b"/>
                    </svg>
                  ),
                  label: "QR Code",
                  sub: lang === "ar" ? "مسح" : "Scannen",
                  color: "#f59e0b",
                },
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2 py-4 px-2"
                  style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  {m.icon}
                  <div className="text-center">
                    <p className="text-white text-xs font-black">{m.label}</p>
                    <p className="text-white/40 text-[10px]">{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 flex items-center justify-center gap-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(34,197,94,0.05)" }}>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-green-400/80 text-[11px] font-bold">
                {lang === "ar" ? "دفع آمن ومشفر بالكامل عبر Mollie" : lang === "nl" ? "Veilig & versleuteld betalen via Mollie" : "Paiement sécurisé via Mollie"}
              </p>
            </div>
          </div>

          {/* ── ضمان ── */}
          <div className="text-center pb-8">
            <p className="text-white/30 text-xs">
              {lang === "ar" ? "✅ وصول فوري بعد الدفع · 🔒 بيانات محمية · 📧 فاتورة على بريدك" : lang === "nl" ? "✅ Directe toegang · 🔒 Beveiligd · 📧 Factuur per e-mail" : "✅ Accès immédiat · 🔒 Sécurisé · 📧 Facture par e-mail"}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ─── شاشة انتهاء الاشتراك ────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f0f0f0" }}>
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">{lang === "ar" ? "انتهى الاشتراك" : lang === "nl" ? "Abonnement verlopen" : "Abonnement expiré"}</h2>
          <p className="text-gray-500 text-sm mb-6">{lang === "ar" ? "يرجى تجديد اشتراكك للوصول للدروس" : lang === "nl" ? "Vernieuw je abonnement om toegang te krijgen" : "Renouvelez votre abonnement"}</p>
          <div className="flex gap-3">
            <button onClick={() => { localStorage.removeItem("userEmail"); localStorage.removeItem("userCategory"); setIsLoggedIn(false); setIsExpired(false); }}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #d4af37, #f0d060)", color: "#0a0a0a" }}>
              {lang === "ar" ? "تجديد" : lang === "nl" ? "Vernieuwen" : "Renouveler"}
            </button>
            <button onClick={() => router.push("/")}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 bg-gray-100 text-gray-600">
              {lang === "ar" ? "الرئيسية" : lang === "nl" ? "Home" : lang === "fr" ? "Accueil" : "Home"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── شاشة الدروس ─────────────────────────────────────────────────────────────
  const filtered = lessons.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "#f0f0f0" }}>
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "#ffcc00", transform: "translate(-30%, -30%)" }}></div>
        </div>
        <div className="relative max-w-2xl md:max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-0.5">
                {lang === "ar" ? "نظرية رخصة القيادة" : lang === "nl" ? "Theorie Rijbewijs" : "Théorie Permis"}
              </p>
              <h1 className="text-xl font-black text-white">
                {userCategory === "A" ? (t.categoryA || "Rijbewijs A") : userCategory === "B" ? (t.categoryB || "Rijbewijs B") : (t.categoryC || "Rijbewijs C")}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
                {lessons.length} {lang === "ar" ? "درس" : lang === "nl" ? "lessen" : "leçons"}
              </span>
              <button
                onClick={() => router.push("/voortgang")}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                📊 {lang === "ar" ? "ملخصاتي" : lang === "nl" ? "Mijn samenvatting" : lang === "fr" ? "Mon résumé" : "My summary"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الدروس */}
      <div className="flex-1 max-w-2xl md:max-w-4xl mx-auto w-full px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="font-bold text-gray-700">{lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : "Aucune leçon disponible"}</p>
          </div>
        ) : (
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "60%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#22c55e" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#16a34a]">
                  {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LEÇON" : "LESSON"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#16a34a] text-center">
                  {lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#16a34a] text-center">
                  EXAM
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson, i) => (
                <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="font-bold text-[#003399] text-sm" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                      {i + 1}. {translatedTitles[lessons.indexOf(lesson)] || lesson.title}
                    </div>
                    {lesson.description && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1 h-3 rounded-full bg-[#3399ff] flex-shrink-0"></span>
                        <span className="text-xs font-semibold text-[#3399ff]">{lesson.description}</span>
                      </div>
                    )}
                  </td>
                  {i === 0 ? (
                    <td colSpan={2} className="px-4 py-3 border border-gray-200 text-center">
                      <button
                        onClick={() => router.push(`/theorie/lesson?lessonId=${lesson.id}&category=${userCategory}&email=${userEmail}&lesson=${encodeURIComponent(lesson.title)}`)}
                        className="border-2 px-4 py-1 text-sm font-bold transition-colors w-full"
                        style={{ background: "#7c3aed", borderColor: "#7c3aed", color: "white" }}
                      >
                        ✔ Start nu
                      </button>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 border border-gray-200 text-center">
                        <button
                          onClick={() => router.push(`/theorie/lesson?lessonId=${lesson.id}&category=${userCategory}&email=${userEmail}&lesson=${encodeURIComponent(lesson.title)}`)}
                          className="bg-white border-2 border-gray-400 px-4 py-1 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors w-full"
                        >
                          {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                        </button>
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-center">
                        <button
                          onClick={() => openExamModal(lesson.id, lesson.title)}
                          disabled={loadingExam}
                          className="border-2 px-4 py-1 text-sm font-bold transition-colors disabled:opacity-60 w-full"
                          style={{ background: "#22c55e", borderColor: "#16a34a", color: "white" }}
                        >
                          EXAM
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />

      {/* Modal اختيار الامتحان */}
      {examModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setExamModal(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: "#eff6ff" }}>
              <div>
                <h3 className="font-black text-[#003399] text-base">🎯 {lang === "ar" ? "اختر الامتحان" : lang === "nl" ? "Kies examen" : lang === "fr" ? "Choisir examen" : "Choose exam"}</h3>
                <p className="text-xs text-blue-500 mt-0.5 truncate">{examModal.lessonTitle}</p>
              </div>
              <button onClick={() => setExamModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center">✕</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {examModal.batches.map((b, i) => (
                <button key={i}
                  onClick={() => {
                    setExamModal(null);
                    router.push(`/examen/test?category=${userCategory}&lesson=${encodeURIComponent(examModal.lessonTitle)}&email=${encodeURIComponent(userEmail)}&lessonId=${examModal.lessonId}&offset=${b.from}&limit=${b.count}`);
                  }}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-black transition-all active:scale-95 hover:opacity-90"
                  style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"2px solid #93c5fd", color:"#1d4ed8"}}
                >
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm">{lang === "ar" ? `امتحان ${i + 1}` : `Examen ${i + 1}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
