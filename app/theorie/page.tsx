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

  const translatedTitles = useAutoTranslateList(lessons.map(l => l.title), lang);

  const categories = [
    { id: "A", name: "Rijbewijs A", desc: t.motorcycles || "Motorfietsen", icon: <MotorcycleIcon className="w-14 h-9" />, color: "#f97316", glow: "rgba(249,115,22,0.2)" },
    { id: "B", name: "Rijbewijs B", desc: t.cars || "Auto's",            icon: <CarIcon className="w-14 h-9" />,        color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
    { id: "C", name: "Rijbewijs C", desc: t.trucks || "Vrachtwagens",    icon: <TruckIcon className="w-14 h-9" />,      color: "#22c55e", glow: "rgba(34,197,94,0.2)" },
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

  const checkAndFetch = async (email: string, category: string) => {
    try {
      const sessionToken = localStorage.getItem("sessionToken") || undefined;
      const res = await fetch("/api/check-subscription", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, sessionToken }) 
      });
      
      if (!res.ok) {
        const lr = await fetch(`/api/lessons?category=${category}`);
        const ld = await lr.json();
        if (ld.success) setLessons(ld.lessons);
        return;
      }
      
      const data = await res.json();

      // تسجيل دخول من جهاز آخر
      if (data.sessionInvalid) {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userCategory");
        localStorage.removeItem("sessionToken");
        setIsLoggedIn(false);
        setLoading(false);
        alert(data.message || "تم تسجيل الدخول من جهاز آخر");
        return;
      }

      if (data.expired) { setIsExpired(true); setLoading(false); return; }

      const lr = await fetch(`/api/lessons?category=${category}`);
      const ld = await lr.json();
      if (ld.success) setLessons(ld.lessons);
    } catch (e) { 
      console.error("checkAndFetch error:", e);
      // عند خطأ في الشبكة - جلب الدروس بدون التحقق
      try {
        const lr = await fetch(`/api/lessons?category=${category}`);
        const ld = await lr.json();
        if (ld.success) setLessons(ld.lessons);
      } catch {}
    }
    finally { setLoading(false); }
  };

  if (showCheckout && globalSelection) {
    return <CheckoutForm selectedData={globalSelection} onBack={() => setShowCheckout(false)} />;
  }

  // ─── شاشة الاشتراك ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}
        style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 50%, #060818 100%)" }}>
        {/* خلفية */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "#ffcc00" }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "#3b82f6" }}></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}></div>
        </div>

        <Navbar />

        <div className="relative z-10 flex-1 px-4 py-8 max-w-lg mx-auto w-full md:max-w-2xl lg:max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold" style={{ background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", color: "#ffcc00" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              {lang === "ar" ? "اشتراك نظري" : lang === "nl" ? "Theorie Abonnement" : "Abonnement Théorie"}
            </div>
            <h1 className="text-2xl font-black text-white mb-2">
              {lang === "ar" ? "اختر فئتك" : lang === "nl" ? "Kies je categorie" : "Choisissez votre catégorie"}
            </h1>
            <p className="text-white/40 text-sm">
              {lang === "ar" ? "وصول كامل لجميع الدروس والأسئلة" : lang === "nl" ? "Volledige toegang tot alle lessen en vragen" : "Accès complet à toutes les leçons"}
            </p>
          </div>

          {/* كروت الفئات */}
          <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 mb-6">
            {categories.map(cat => {
              const durations = getDurations(cat.id);
              const isSelected = globalSelection?.catId === cat.id;
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group"
                  style={{
                    background: isSelected ? `${cat.color}15` : "rgba(255,255,255,0.05)",
                    border: isSelected ? `2px solid ${cat.color}60` : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: isSelected ? `0 12px 40px ${cat.glow}` : "none",
                    transform: "translateY(0)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px ${cat.glow}`; (e.currentTarget as HTMLElement).style.border = `1.5px solid ${cat.color}50`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = isSelected ? `0 12px 40px ${cat.glow}` : "none"; (e.currentTarget as HTMLElement).style.border = isSelected ? `2px solid ${cat.color}60` : "1px solid rgba(255,255,255,0.1)"; }}
                >
                  {/* رأس الكرت */}
                  <div className="flex items-center gap-4 px-5 py-5">
                    <div className="flex-shrink-0 opacity-90">{cat.icon}</div>
                    <div className="flex-1">
                      <p className="text-white font-black text-lg">{cat.name}</p>
                      <p className="text-white/50 text-sm mt-0.5">{cat.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cat.color }}>
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>

                  {/* فاصل */}
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 20px" }}></div>

                  {/* زر Gratis */}
                  <div className="px-4 pt-4">
                    <button
                      onClick={() => router.push(`/gratis?cat=${cat.id}`)}
                      className="w-full py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
                      🎁 Gratis proberen
                    </button>
                  </div>

                  {/* أزرار المدة */}
                  <div className="grid grid-cols-2 gap-2.5 px-4 py-4">
                    {durations.map(dur => {
                      const active = isSelected && globalSelection?.duration === dur.key;
                      return (
                        <button key={dur.key}
                          onClick={() => setGlobalSelection({ catId: cat.id, duration: dur.key, catName: cat.name })}
                          className="py-4 rounded-xl transition-all active:scale-95"
                          style={{
                            background: active ? cat.color : "rgba(255,255,255,0.07)",
                            border: active ? `1.5px solid ${cat.color}` : "1.5px solid rgba(255,255,255,0.12)",
                            boxShadow: active ? `0 4px 16px ${cat.color}40` : "none",
                          }}>
                          <p className="text-xs font-bold mb-1" style={{ color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)" }}>{dur.label}</p>
                          <p className="text-2xl font-black" style={{ color: active ? "white" : "rgba(255,255,255,0.85)" }}>€{dur.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* زر الاشتراك */}
          <button
            onClick={() => globalSelection && setShowCheckout(true)}
            disabled={!globalSelection}
            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 disabled:opacity-30"
            style={{
              background: globalSelection ? "linear-gradient(135deg, #ffcc00, #ff9900)" : "rgba(255,255,255,0.1)",
              color: globalSelection ? "#003399" : "rgba(255,255,255,0.3)",
              boxShadow: globalSelection ? "0 8px 30px rgba(255,204,0,0.35)" : "none",
            }}>
            {globalSelection
              ? `${lang === "ar" ? "اشترك في" : lang === "nl" ? "Inschrijven voor" : "S'inscrire pour"} ${globalSelection.catName} — €${getDurations(globalSelection.catId).find(d => d.key === globalSelection.duration)?.price}`
              : (lang === "ar" ? "اختر فئة ومدة أولاً" : lang === "nl" ? "Kies een categorie en duur" : "Choisissez une catégorie")}
          </button>

          {/* مميزات */}
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: "📚", label: lang === "ar" ? "دروس كاملة" : "Alle lessen" },
              { icon: "❓", label: lang === "ar" ? "أسئلة تدريبية" : "Oefenvragen" },
              { icon: "🎯", label: lang === "ar" ? "امتحانات" : "Examens" },
            ].map((f, i) => (
              <div key={i} className="text-center py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-white/50 text-[10px] font-bold">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── شاشة انتهاء الاشتراك ────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 50%, #060818 100%)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-black text-white mb-2">{lang === "ar" ? "انتهى الاشتراك" : lang === "nl" ? "Abonnement verlopen" : "Abonnement expiré"}</h2>
        <p className="text-white/40 text-sm mb-6 text-center">{lang === "ar" ? "يرجى تجديد اشتراكك للوصول للدروس" : lang === "nl" ? "Vernieuw je abonnement om toegang te krijgen" : "Renouvelez votre abonnement"}</p>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { localStorage.removeItem("userEmail"); localStorage.removeItem("userCategory"); setIsLoggedIn(false); setIsExpired(false); }}
            className="flex-1 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
            {lang === "ar" ? "تجديد" : lang === "nl" ? "Vernieuwen" : "Renouveler"}
          </button>
          <button onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {lang === "ar" ? "الرئيسية" : "Home"}
          </button>
        </div>
      </div>
    );
  }

  // ─── شاشة الدروس ─────────────────────────────────────────────────────────────
  const filtered = lessons.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "#f0f4f8" }}>
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
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
                {lang === "ar" ? `فئة ${userCategory}` : `Rijbewijs ${userCategory}`}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
                {lessons.length} {lang === "ar" ? "درس" : lang === "nl" ? "lessen" : "leçons"}
              </span>
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
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                  {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LEÇON" : "LESSON"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  EXAM
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson, i) => (
                <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="font-bold text-[#003399] text-base">
                      {i + 1}. {translatedTitles[lessons.indexOf(lesson)] || lesson.title}
                    </div>
                    {lesson.description && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1 h-3 rounded-full bg-[#3399ff] flex-shrink-0"></span>
                        <span className="text-xs font-semibold text-[#3399ff]">{lesson.description}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => router.push(`/theorie/lesson?lessonId=${lesson.id}&category=${userCategory}&email=${userEmail}&lesson=${encodeURIComponent(lesson.title)}`)}
                      className="bg-white border-2 border-gray-400 px-4 py-1 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                    >
                      {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                    </button>
                  </td>
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => router.push(`/examen/category?cat=${userCategory}&email=${userEmail}&lessonId=${lesson.id}`)}
                      className="bg-white border-2 border-orange-400 px-4 py-1 text-sm font-bold text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                    >
                      EXAM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
