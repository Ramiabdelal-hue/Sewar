"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useAutoTranslate, useAutoTranslateList } from "@/hooks/useAutoTranslate";
import Footer from "@/components/Footer";

function GratisLessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const category = searchParams.get("category") || "B";
  const lessonId = searchParams.get("lessonId");
  const lessonTitle = searchParams.get("lesson") || "";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translatedLessonTitle = useAutoTranslate(lessonTitle, lang);

  useEffect(() => {
    if (!lessonId) { setLoading(false); return; }
    fetch(`/api/free-content?category=${category}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const filtered = d.questions.filter((q: any) => q.lessonId === Number(lessonId));
          setQuestions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId, category]);

  const currentQuestion = questions[currentIndex] || null;
  const textsToTranslate = currentQuestion
    ? [currentQuestion.textNL || currentQuestion.text || "", currentQuestion.answer1 || "", currentQuestion.answer2 || "", currentQuestion.answer3 || ""]
    : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
      <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-bold text-gray-700 mb-4">
            {lang === "ar" ? "لا توجد أسئلة مجانية لهذا الدرس" : lang === "nl" ? "Geen gratis vragen voor deze les" : "No free questions for this lesson"}
          </p>
          <button onClick={() => router.back()} className="px-6 py-2 rounded-xl font-bold text-white" style={{ background: "#22c55e" }}>
            {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Retour"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}>
        <div className="relative max-w-2xl md:max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">🎁 Gratis</p>
              <h1 className="text-base font-black text-white truncate max-w-xs">{translatedLessonTitle || lessonTitle}</h1>
            </div>
            <span className="ml-auto px-3 py-1 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 max-w-2xl md:max-w-4xl mx-auto w-full px-4 py-4">
        {currentQuestion && (
          <QuestionCard
            question={{ ...currentQuestion, text: translatedTexts[0] || currentQuestion.textNL || currentQuestion.text, answer1: translatedTexts[1] || currentQuestion.answer1, answer2: translatedTexts[2] || currentQuestion.answer2, answer3: translatedTexts[3] || currentQuestion.answer3 }}
            index={currentIndex}
            total={questions.length}
            lang={lang}
            onNext={() => { if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); }}
            onPrev={() => { if (currentIndex > 0) setCurrentIndex(i => i - 1); }}
          />
        )}

        {/* زر الاشتراك */}
        <div className="mt-4">
          <button onClick={() => router.push("/theorie")}
            className="w-full py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)", color: "#0a0a0a", boxShadow: "0 4px 14px rgba(212,175,55,0.35)" }}>
            🔓 {lang === "ar" ? "اشترك للمزيد" : lang === "nl" ? "Meer? Inschrijven" : lang === "fr" ? "Plus? S'inscrire" : "More? Subscribe"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function GratisLessonPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div></div>}>
      <GratisLessonContent />
    </Suspense>
  );
}
