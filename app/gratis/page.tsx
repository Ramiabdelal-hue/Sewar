"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

function GratisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const catParam = searchParams.get("cat")?.toUpperCase() || "B";
  const [selectedCat, setSelectedCat] = useState(catParam);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "A", name: t.categoryA || "Rijbewijs A", icon: <MotorcycleIcon className="w-14 h-9" />, color: "#f97316" },
    { id: "B", name: t.categoryB || "Rijbewijs B", icon: <CarIcon className="w-14 h-9" />, color: "#3b82f6" },
    { id: "C", name: t.categoryC || "Rijbewijs C", icon: <TruckIcon className="w-14 h-9" />, color: "#22c55e" },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/free-content?category=${selectedCat}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const lessonMap = new Map<number, any>();
          for (const q of d.questions) {
            if (q.lesson && q.lessonId && !lessonMap.has(q.lessonId)) {
              lessonMap.set(q.lessonId, { id: q.lessonId, title: q.lesson.title, description: q.lesson.description });
            }
          }
          const sorted = Array.from(lessonMap.values()).sort((a, b) => a.id - b.id);
          setLessons(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCat]);

  const translatedTitles = useAutoTranslateList(lessons.map(l => l.title), lang);

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"} style={{ background: "#f0f0f0" }}>
      <Navbar />

      {/* Header - نفس تصميم theorie */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "#ffcc00", transform: "translate(-30%, -30%)" }}></div>
        </div>
        <div className="relative max-w-2xl md:max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-0.5">
                🎁 {lang === "ar" ? "محتوى مجاني" : lang === "nl" ? "Gratis Inhoud" : lang === "fr" ? "Contenu Gratuit" : "Free Content"}
              </p>
              <h1 className="text-xl font-black text-white">
                {categories.find(c => c.id === selectedCat)?.name || "Rijbewijs B"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
                {lessons.length} {lang === "ar" ? "درس" : lang === "nl" ? "lessen" : "leçons"}
              </span>
            </div>
          </div>

          {/* أزرار الفئات */}
          <div className="flex gap-2 mt-4">
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="px-4 py-2 rounded-xl font-black text-sm transition-all"
                style={{
                  background: selectedCat === cat.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                  color: "white",
                  border: selectedCat === cat.id ? "2px solid rgba(255,255,255,0.6)" : "2px solid rgba(255,255,255,0.15)",
                }}>
                {cat.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* قائمة الدروس - نفس تصميم theorie */}
      <div className="flex-1 max-w-2xl md:max-w-4xl mx-auto w-full px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="font-bold text-gray-700">{lang === "ar" ? "لا توجد دروس مجانية متاحة" : lang === "nl" ? "Geen gratis lessen beschikbaar" : "Aucune leçon gratuite disponible"}</p>
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
              {lessons.map((lesson, i) => (
                <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="font-bold text-[#003399] text-base" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                      {i + 1}. {translatedTitles[i] || lesson.title}
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
                        onClick={() => router.push(`/gratis/lesson?lessonId=${lesson.id}&category=${selectedCat}&lesson=${encodeURIComponent(lesson.title)}`)}
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
                          onClick={() => router.push(`/gratis/lesson?lessonId=${lesson.id}&category=${selectedCat}&lesson=${encodeURIComponent(lesson.title)}`)}
                          className="bg-white border-2 border-gray-400 px-4 py-1 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors w-full"
                        >
                          {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                        </button>
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-center">
                        <button
                          onClick={() => router.push(`/gratis/exam?category=${selectedCat}&lessonId=${lesson.id}&lesson=${encodeURIComponent(lesson.title)}`)}
                          className="border-2 px-4 py-1 text-sm font-bold transition-colors w-full"
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

        {/* زر الاشتراك */}
        {!loading && (
          <div className="mt-6">
            <button
              onClick={() => router.push(`/theorie`)}
              className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)", color: "#0a0a0a", boxShadow: "0 8px 30px rgba(212,175,55,0.35)" }}>
              🔓 {lang === "ar" ? "اشترك للوصول لكل الدروس" : lang === "nl" ? "Inschrijven voor alle lessen" : lang === "fr" ? "S'inscrire pour toutes les leçons" : "Subscribe for all lessons"}
            </button>
          </div>
        )}
      </div>

      <Footer />

    </div>
  );
}

export default function GratisPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div></div>}>
      <GratisContent />
    </Suspense>
  );
}
