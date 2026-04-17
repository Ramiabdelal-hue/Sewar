"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useLang } from "@/context/LangContext";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";

export default function GratisPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "ar";

  const [category, setCategory] = useState("B");
  const [tab, setTab] = useState<"lessons" | "exam">("lessons");
  const [questions, setQuestions] = useState<any[]>([]);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { id: "A", label: "Rijbewijs A", icon: <MotorcycleIcon className="w-10 h-6" />, color: "#f97316" },
    { id: "B", label: "Rijbewijs B", icon: <CarIcon className="w-10 h-6" />,        color: "#3b82f6" },
    { id: "C", label: "Rijbewijs C", icon: <TruckIcon className="w-10 h-6" />,      color: "#22c55e" },
  ];

  useEffect(() => {
    setLoading(true);
    setCurrentIndex(0);
    fetch(`/api/free-content?category=${category}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setQuestions(d.questions || []);
          setExamQuestions(d.examQuestions || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  const activeItems = tab === "lessons" ? questions : examQuestions;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Gratis Lessen</h1>
              <p className="text-white/50 text-xs">
                {lang === "ar" ? "محتوى مجاني بدون اشتراك" : lang === "nl" ? "Gratis inhoud zonder abonnement" : "Contenu gratuit sans abonnement"}
              </p>
            </div>
          </div>

          {/* اختيار الفئة */}
          <div className="flex gap-2 mb-3">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setCurrentIndex(0); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
                style={category === cat.id ? { background: cat.color, color: "white" } : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.id}</span>
              </button>
            ))}
          </div>

          {/* تبويبين */}
          <div className="flex gap-2">
            <button onClick={() => { setTab("lessons"); setCurrentIndex(0); }}
              className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={tab === "lessons" ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              📚 {lang === "ar" ? "شروح" : "Lessen"} ({questions.length})
            </button>
            <button onClick={() => { setTab("exam"); setCurrentIndex(0); }}
              className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={tab === "exam" ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              🎯 {lang === "ar" ? "امتحانات" : "Examens"} ({examQuestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-xl font-black text-gray-700 mb-2">
              {lang === "ar" ? "لا يوجد محتوى مجاني بعد" : lang === "nl" ? "Nog geen gratis inhoud" : "Pas encore de contenu gratuit"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {lang === "ar" ? "سيتم إضافة محتوى مجاني قريباً" : lang === "nl" ? "Gratis inhoud wordt binnenkort toegevoegd" : "Du contenu gratuit sera bientôt ajouté"}
            </p>
            <button onClick={() => router.push("/theorie")}
              className="px-6 py-3 rounded-xl font-black text-sm text-white"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              {lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Nu inschrijven" : "S'inscrire maintenant"}
            </button>
          </div>
        ) : (
          <>
            {/* عداد */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500">{currentIndex + 1} / {activeItems.length}</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-[#003399] h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / activeItems.length) * 100}%` }}></div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                🎁 Gratis
              </span>
            </div>

            {/* عنوان الدرس */}
            {activeItems[currentIndex]?.lesson && (
              <div className="mb-3 px-4 py-2 rounded-xl text-xs font-bold text-[#003399]"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                📚 {activeItems[currentIndex].lesson.title}
              </div>
            )}

            {/* المحتوى */}
            <QuestionCard
              question={activeItems[currentIndex]}
              index={currentIndex}
              total={activeItems.length}
              lang={lang}
              onNext={() => {}}
              onPrev={() => {}}
            />

            {/* أزرار التنقل */}
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex === 0}
                className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex === 0 ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"}`}>
                ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : "Précédent"}
              </button>
              <button onClick={() => router.push("/theorie")}
                className="px-4 py-2 rounded-xl font-black text-xs"
                style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
                🔓 {lang === "ar" ? "اشترك للمزيد" : lang === "nl" ? "Meer? Inschrijven" : "Plus?"}
              </button>
              <button onClick={() => { setCurrentIndex(Math.min(activeItems.length - 1, currentIndex + 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex + 1 >= activeItems.length}
                className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex + 1 >= activeItems.length ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-white border-[#003399] bg-[#003399] hover:bg-[#0055cc]"}`}>
                {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : "Suivant"} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
