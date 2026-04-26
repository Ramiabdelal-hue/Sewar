"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import Footer from "@/components/Footer";

interface Question {
  id: number;
  text: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  videoUrls?: string[];
  audioUrl?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
}

function GratisLessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const category = searchParams.get("category") || "B";
  const lessonId = searchParams.get("lessonId");
  const lessonTitle = searchParams.get("lesson") || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonDescription, setLessonDescription] = useState("");

  // ترجمة عنوان الدرس تلقائياً
  const translatedLessonTitle = useAutoTranslate(lessonTitle, lang);

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  const fetchQuestions = async () => {
    try {
      if (!lessonId) {
        console.error("❌ No lessonId provided");
        setLoading(false);
        return;
      }
      
      // جلب الأسئلة المجانية فقط
      const res = await fetch(`/api/free-content?category=${category}`);
      const data = await res.json();

      if (data.success) {
        // تصفية الأسئلة للدرس المحدد فقط
        const filtered = data.questions.filter((q: any) => q.lessonId === Number(lessonId));
        setQuestions(filtered);
        
        // الحصول على وصف الدرس من أول سؤال
        if (filtered.length > 0 && filtered[0].lesson?.description) {
          setLessonDescription(filtered[0].lesson.description);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {lang === "ar" ? "جاري تحميل الأسئلة المجانية..." : lang === "nl" ? "Gratis vragen laden..." : "Chargement des questions gratuites..."}
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {lang === "ar" ? "لا توجد أسئلة مجانية" : lang === "nl" ? "Geen gratis vragen" : "Aucune question gratuite"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ar" ? "لم يتم إضافة أسئلة مجانية لهذا الدرس بعد" : lang === "nl" ? "Er zijn nog geen gratis vragen toegevoegd voor deze les" : "Aucune question gratuite n'a encore été ajoutée pour cette leçon"}
          </p>
          <button
            onClick={() => router.push("/gratis")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "العودة للدروس المجانية" : lang === "nl" ? "Terug naar gratis lessen" : "Retour aux leçons gratuites"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push("/gratis")}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(34,197,94,0.15)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)" }}>
                🎁 Gratis
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">{translatedLessonTitle || lessonTitle}</h1>
            {lessonDescription && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mt-1"
                style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1px solid #c4b5fd" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                <span className="text-sm font-semibold text-purple-700">{lessonDescription}</span>
              </div>
            )}
          </div>

          {/* كل أسئلة الدرس في نفس الصفحة */}
          <div className="space-y-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                lang={lang}
                onNext={() => {}}
                onPrev={() => {}}
              />
            ))}
          </div>

          {/* زر العودة في الأسفل */}
          <div className="mt-6 pb-4">
            <button
              onClick={() => { router.push("/gratis"); window.scrollTo(0, 0); }}
              className="w-full py-3 font-black text-sm border-2 border-[#22c55e] text-[#22c55e] rounded-xl hover:bg-[#22c55e] hover:text-white transition-all"
            >
              ← {lang === "ar" ? "العودة للدروس المجانية" : lang === "nl" ? "Terug naar gratis lessen" : lang === "fr" ? "Retour aux leçons gratuites" : "Back to free lessons"}
            </button>
          </div>

          {/* زر الاشتراك */}
          <div className="mt-4">
            <button onClick={() => router.push("/theorie")}
              className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)", color: "#0a0a0a", boxShadow: "0 8px 30px rgba(212,175,55,0.35)" }}>
              🔓 {lang === "ar" ? "اشترك للوصول لكل الدروس" : lang === "nl" ? "Inschrijven voor alle lessen" : lang === "fr" ? "S'inscrire pour toutes les leçons" : "Subscribe for all lessons"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function GratisLessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl font-bold">Loading...</div></div>}>
      <GratisLessonContent />
    </Suspense>
  );
}
