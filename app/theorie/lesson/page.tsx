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
import { useAutoTranslate, useAutoTranslateList } from "@/hooks/useAutoTranslate";
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

function TheorieLessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const category = searchParams.get("category");
  const lesson = searchParams.get("lesson");
  const email = searchParams.get("email");
  const lessonId = searchParams.get("lessonId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(true);
  const [lessonDescription, setLessonDescription] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // ترجمة عنوان الدرس تلقائياً
  const translatedLessonTitle = useAutoTranslate(lesson || "", lang);

  useEffect(() => {
    if (email) {
      localStorage.setItem("userEmail", email);
    }
    if (category) {
      localStorage.setItem("userCategory", category);
    }

    const checkSubscription = async () => {
      const emailToCheck = localStorage.getItem("userEmail") || email;
      if (!emailToCheck) {
        setIsExpired(true);
        setChecking(false);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToCheck })
        });
        // إذا فشل الـ API - لا نعتبره منتهياً
        if (!response.ok) {
          console.warn("check-subscription failed:", response.status);
          setChecking(false);
          return;
        }
        const data = await response.json();
        if (data.expired) {
          setIsExpired(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        // عند خطأ شبكة - لا نعتبره منتهياً
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [email, category]);

  useEffect(() => {
    if (lessonId && !isExpired && !checking) {
      fetchQuestions();
    }
  }, [lessonId, isExpired, checking]);

  const fetchQuestions = async () => {
    try {
      if (!lessonId) {
        console.error("❌ No lessonId provided");
        setLoading(false);
        return;
      }
      const url = `/api/questions?lessonId=${lessonId}&category=${category || "B"}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions);
        if (data.lesson?.description) setLessonDescription(data.lesson.description);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const currentQuestion = questions[currentIndex] || null;

  // Hook يجب أن يكون دائماً في نفس المكان - قبل أي return مشروط
  const textsToTranslate = currentQuestion ? [
    currentQuestion.text || "",
    currentQuestion.answer1 || "",
    currentQuestion.answer2 || "",
    currentQuestion.answer3 || "",
  ] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {checking 
              ? (lang === "ar" ? "جاري التحقق من الاشتراك..." : lang === "nl" ? "Abonnement controleren..." : "Vérification de l'abonnement...")
              : (lang === "ar" ? "جاري تحميل الأسئلة..." : lang === "nl" ? "Vragen laden..." : "Chargement des questions...")
            }
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {lang === "ar" ? "انتهت صلاحية الاشتراك" : lang === "nl" ? "Abonnement verlopen" : "Abonnement expiré"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ar" ? "عذراً، انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للوصول إلى الدروس." : lang === "nl" ? "Sorry, je abonnement is verlopen. Vernieuw je abonnement om toegang te krijgen tot lessen." : "Désolé, votre abonnement a expiré. Veuillez renouveler votre abonnement pour accéder aux leçons."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "تجديد الاشتراك" : lang === "nl" ? "Abonnement vernieuwen" : "Renouveler l'abonnement"}
          </button>
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
            {lang === "ar" ? "لا توجد أسئلة" : lang === "nl" ? "Geen vragen" : "Aucune question"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ar" ? "لم يتم إضافة أسئلة لهذا الدرس بعد" : lang === "nl" ? "Er zijn nog geen vragen toegevoegd voor deze les" : "Aucune question n'a encore été ajoutée pour cette leçon"}
          </p>
          <button
            onClick={() => router.push("/theorie")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "العودة للدروس" : lang === "nl" ? "Terug naar lessen" : "Retour aux leçons"}
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
                onClick={() => router.push("/theorie")}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">{translatedLessonTitle || lesson}</h1>
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
              onClick={() => { router.push("/theorie"); window.scrollTo(0, 0); }}
              className="w-full py-3 font-black text-sm border-2 border-[#003399] text-[#003399] rounded-xl hover:bg-[#003399] hover:text-white transition-all"
            >
              ← {lang === "ar" ? "العودة للدروس" : lang === "nl" ? "Terug naar lessen" : lang === "fr" ? "Retour aux leçons" : "Back to lessons"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function TheorieLessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl font-bold">Loading...</div></div>}>
      <TheorieLessonContent />
    </Suspense>
  );
}
