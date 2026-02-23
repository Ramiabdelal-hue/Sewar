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

function ExamenTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const category = searchParams.get("category"); // A, B, C
  const lesson = searchParams.get("lesson");
  const email = searchParams.get("email");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  // التحقق من صلاحية الاشتراك
  useEffect(() => {
    // حفظ بيانات المستخدم في localStorage إذا كانت موجودة في URL
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
      // استخدام lessonId مباشرة بدلاً من lesson name
      // نحتاج إلى تحديد lessonId من الدرس المختار
      // للامتحانات، نستخدم الدروس ذات questionType = "Examen"
      
      // تحديد lessonId بناءً على الفئة
      let examLessonId;
      if (category === "A") {
        examLessonId = 20; // Proefexamen categorie A
      } else if (category === "B") {
        examLessonId = 32; // Proefexamen categorie B
      } else if (category === "C") {
        examLessonId = 45; // Proefexamen categorie C
      }

      console.log("🔍 Fetching exam questions for category:", category, "lessonId:", examLessonId);
      
      const url = `/api/questions?lessonId=${examLessonId}`;
      console.log("📡 API URL:", url);
      
      const res = await fetch(url);
      const data = await res.json();

      console.log("📊 API Response:", data);

      if (data.success) {
        setQuestions(data.questions);
        console.log(`✅ Loaded ${data.questions.length} questions`);
      } else {
        console.error("❌ Failed to fetch questions:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answerNumber: number) => {
    if (!showResults) {
      setUserAnswers({ ...userAnswers, [questionId]: answerNumber });
    }
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);

    // إعداد بيانات الأسئلة والأجوبة للحفظ
    const answersData = questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      imageUrls: q.imageUrls || [],
      audioUrl: q.audioUrl || null,
      answer1: q.answer1,
      answer2: q.answer2,
      answer3: q.answer3,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[q.id] || null,
      isCorrect: userAnswers[q.id] === q.correctAnswer
    }));

    // حفظ النتيجة في قاعدة البيانات
    console.log("💾 Attempting to save result...");
    console.log("Email:", email);
    console.log("Lesson:", lesson);
    console.log("Category:", category);
    console.log("Score:", correctCount);
    console.log("Total:", questions.length);

    if (email && lesson && category) {
      try {
        const payload = {
          userEmail: email,
          lessonTitle: lesson,
          category: category,
          score: correctCount,
          totalQuestions: questions.length,
          answers: answersData
        };
        
        console.log("📤 Sending payload:", payload);

        const response = await fetch("/api/exam-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        console.log("📡 Response status:", response.status);
        
        const data = await response.json();
        console.log("✅ Save result response:", data);

        if (!data.success) {
          console.error("❌ Failed to save result:", data.message);
          console.error("❌ Error details:", data.error);
        } else {
          console.log("🎉 Result saved successfully to database!");
        }
      } catch (error) {
        console.error("❌ Error saving result:", error);
        console.error("❌ Error type:", error instanceof Error ? error.message : typeof error);
      }
    } else {
      console.error("❌ Missing required data:", { email, lesson, category });
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {checking ? "Abonnement controleren..." : "Vragen laden..."}
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
            Abonnement verlopen
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, je abonnement is verlopen. Vernieuw je abonnement om toegang te krijgen tot examens.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Abonnement vernieuwen
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
            Geen vragen
          </h2>
          <p className="text-gray-600 mb-6">
            Er zijn nog geen vragen toegevoegd voor deze les
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Terug naar home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Terug
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Examen Test
          </h1>
          <p className="text-gray-600">
            Categorie {category} - {lesson}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Aantal vragen:</span>
              <span className="font-bold text-blue-600 ml-2">{questions.length}</span>
            </div>
            {showResults && (
              <div className={`px-4 py-2 rounded-lg ${score >= questions.length * 0.7 ? "bg-green-50" : "bg-red-50"}`}>
                <span className="text-sm text-gray-600">Score:</span>
                <span className={`font-bold ml-2 ${score >= questions.length * 0.7 ? "text-green-600" : "text-red-600"}`}>
                  {score} / {questions.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = showResults && userAnswer === question.correctAnswer;
            const isWrong = showResults && userAnswer && userAnswer !== question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${
                  showResults
                    ? isCorrect
                      ? "ring-4 ring-green-400 shadow-green-200"
                      : isWrong
                      ? "ring-4 ring-red-400 shadow-red-200"
                      : "ring-2 ring-gray-200"
                    : "hover:shadow-2xl"
                }`}
              >
                {/* Question Header */}
                <div className={`px-6 py-4 ${
                  showResults
                    ? isCorrect
                      ? "bg-gradient-to-r from-green-50 to-emerald-50"
                      : isWrong
                      ? "bg-gradient-to-r from-red-50 to-pink-50"
                      : "bg-gradient-to-r from-gray-50 to-slate-50"
                    : "bg-gradient-to-r from-orange-50 to-amber-50"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                      showResults
                        ? isCorrect
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : isWrong
                          ? "bg-gradient-to-br from-red-500 to-pink-600"
                          : "bg-gradient-to-br from-gray-400 to-slate-500"
                        : "bg-gradient-to-br from-orange-500 to-amber-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Vraag {index + 1}
                      </p>
                      {showResults && (
                        <p className={`text-sm font-bold ${
                          isCorrect ? "text-green-600" : isWrong ? "text-red-600" : "text-gray-600"
                        }`}>
                          {isCorrect 
                            ? "✓ Correct"
                            : isWrong 
                            ? "✗ Fout"
                            : "Niet beantwoord"
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6">
                  <p className="text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                    {question.textNL || question.text}
                  </p>

                  {/* Images */}
                  {question.imageUrls && question.imageUrls.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {question.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Question ${index + 1} image ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-2xl border-4 border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio */}
                  {question.audioUrl && (
                    <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border-2 border-purple-200">
                      <audio controls className="w-full">
                        <source src={question.audioUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}

                  {/* Answers */}
                  <div className="space-y-4 mt-6">
                    {[1, 2, 3].map((num) => {
                      const answerKey = `answer${num}` as keyof Question;
                      const answerText = question[answerKey] as string;
                      
                      if (!answerText) return null;

                      const isSelected = userAnswer === num;
                      const isCorrectAnswer = question.correctAnswer === num;

                      return (
                        <button
                          key={num}
                          onClick={() => handleAnswerSelect(question.id, num)}
                          disabled={showResults}
                          className={`w-full text-left p-5 rounded-2xl border-3 transition-all duration-300 transform ${
                            showResults
                              ? isCorrectAnswer
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-200"
                                : isSelected && !isCorrectAnswer
                                ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-400 shadow-lg shadow-red-200"
                                : "bg-gray-50 border-gray-200"
                              : isSelected
                              ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400 shadow-xl shadow-orange-200 scale-[1.02]"
                              : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-lg hover:scale-[1.01]"
                          } ${!showResults && "cursor-pointer active:scale-95"}`}
                          style={{ borderWidth: '3px' }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-xl border-3 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                showResults
                                  ? isCorrectAnswer
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 shadow-lg"
                                    : isSelected && !isCorrectAnswer
                                    ? "bg-gradient-to-br from-red-500 to-pink-600 border-red-600 shadow-lg"
                                    : "border-gray-300 bg-white"
                                  : isSelected
                                  ? "bg-gradient-to-br from-orange-500 to-amber-600 border-orange-600 shadow-lg"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {((showResults && isCorrectAnswer) || (!showResults && isSelected)) && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {showResults && isSelected && !isCorrectAnswer && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`flex-1 font-semibold text-lg ${
                              showResults
                                ? isCorrectAnswer
                                  ? "text-green-800"
                                  : isSelected && !isCorrectAnswer
                                  ? "text-red-800"
                                  : "text-gray-700"
                                : isSelected
                                ? "text-orange-800"
                                : "text-gray-700"
                            }`}>{answerText}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!showResults && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl shadow-xl p-8 border-2 border-orange-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                  {Object.keys(userAnswers).length}
                </div>
                <span className="text-gray-700 font-semibold">
                  van {questions.length} vragen
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length !== questions.length}
              className={`w-full py-5 rounded-2xl font-black text-2xl transition-all duration-300 transform ${
                Object.keys(userAnswers).length === questions.length
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-2xl shadow-orange-300 hover:scale-[1.02] active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {Object.keys(userAnswers).length === questions.length ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Antwoorden indienen
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Beantwoord alle vragen
                </span>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="mt-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border-4 border-indigo-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl mb-6">
                <span className="text-4xl font-black text-white">{Math.round((score / questions.length) * 100)}%</span>
              </div>
              
              <h3 className="text-3xl font-black text-gray-800 mb-4">
                Eindresultaat
              </h3>
              
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="bg-white rounded-2xl px-8 py-4 shadow-lg">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">
                    Correct
                  </p>
                  <p className="text-4xl font-black text-green-600">{score}</p>
                </div>
                
                <div className="text-4xl font-black text-gray-300">/</div>
                
                <div className="bg-white rounded-2xl px-8 py-4 shadow-lg">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">
                    Totaal
                  </p>
                  <p className="text-4xl font-black text-indigo-600">{questions.length}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  Opnieuw proberen
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="bg-white text-gray-700 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all shadow-xl border-2 border-gray-200 hover:scale-105 active:scale-95"
                >
                  Terug naar home
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function ExamenTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl font-bold">Loading...</div></div>}>
      <ExamenTestContent />
    </Suspense>
  );
}
