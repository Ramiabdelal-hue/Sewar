"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import Navbar from "@/components/Navbar";

interface Question {
  id: number;
  text: string;
  imageUrls?: string[];
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
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const category = searchParams.get("category");
  const lesson = searchParams.get("lesson");
  const email = searchParams.get("email");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (email) {
      localStorage.setItem("userEmail", email);
    }
    if (category) {
      localStorage.setItem("userCategory", category);
    }

    const checkSubscription = async () => {
      if (!email) {
        setIsExpired(true);
        setChecking(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.expired || !data.success) {
          setIsExpired(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [email, category]);

  useEffect(() => {
    if (lesson && category && !isExpired && !checking) {
      fetchQuestions();
    }
  }, [lesson, category, isExpired, checking]);

  const fetchQuestions = async () => {
    try {
      const url = `/api/questions?lesson=${encodeURIComponent(lesson!)}&category=${category}&questionType=Theori`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions);
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

  const currentQuestion = questions[currentIndex];

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

            <h1 className="text-2xl font-bold text-gray-800 mb-2">{lesson}</h1>
            <p className="text-gray-600">
              {lang === "ar" ? `السؤال ${currentIndex + 1} من ${questions.length}` : lang === "nl" ? `Vraag ${currentIndex + 1} van ${questions.length}` : `Question ${currentIndex + 1} sur ${questions.length}`}
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <p className="text-xl text-gray-800 leading-relaxed mb-6 font-medium">{currentQuestion.text}</p>

            {/* Images */}
            {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentQuestion.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Question image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-2xl border-4 border-gray-100 shadow-md"
                  />
                ))}
              </div>
            )}

            {/* Audio */}
            {currentQuestion.audioUrl && (
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border-2 border-purple-200">
                <audio controls className="w-full">
                  <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {/* Show Answer Button */}
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg"
              >
                {lang === "ar" ? "عرض الإجابة" : lang === "nl" ? "Toon antwoord" : "Afficher la réponse"}
              </button>
            )}

            {/* Answers */}
            {showAnswer && (
              <div className="space-y-4 mt-6">
                {[1, 2, 3].map((num) => {
                  const answerKey = `answer${num}` as keyof Question;
                  const answerText = currentQuestion[answerKey] as string;
                  
                  if (!answerText) return null;

                  const isCorrect = currentQuestion.correctAnswer === num;

                  return (
                    <div
                      key={num}
                      className={`p-5 rounded-2xl border-3 ${
                        isCorrect
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      style={{ borderWidth: '3px' }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isCorrect
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isCorrect ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            num
                          )}
                        </div>
                        <span className={`flex-1 font-semibold text-lg ${
                          isCorrect ? "text-green-800" : "text-gray-700"
                        }`}>{answerText}</span>
                        {isCorrect && (
                          <span className="text-sm font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                            {lang === "ar" ? "الإجابة الصحيحة" : lang === "nl" ? "Juiste antwoord" : "Bonne réponse"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg border-2 border-gray-200"
              }`}
            >
              {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : "Précédent"}
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                currentIndex === questions.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-lg"
              }`}
            >
              {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : "Suivant"}
            </button>
          </div>
        </div>
      </div>
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
