"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import Navbar from "@/components/Navbar";

interface Question {
  id: number;
  text: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  imageUrls?: string[];
  audioUrl?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
}

// Component for Question with Language Buttons
function QuestionWithLanguages({ question, lang }: { question: Question; lang: string }) {
  const [selectedLang, setSelectedLang] = useState<'nl' | 'fr' | 'ar'>('nl');

  const getQuestionText = () => {
    if (selectedLang === 'nl' && question.textNL) return question.textNL;
    if (selectedLang === 'fr' && question.textFR) return question.textFR;
    if (selectedLang === 'ar' && question.textAR) return question.textAR;
    return question.textNL || question.textFR || question.textAR || question.text;
  };

  const hasMultipleLanguages = [question.textNL, question.textFR, question.textAR].filter(Boolean).length > 1;

  return (
    <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {lang === "ar" ? "السؤال" : lang === "nl" ? "Vraag" : "Question"}
        </h3>
        
        {/* Language Buttons */}
        {hasMultipleLanguages && (
          <div className="flex gap-2">
            {question.textNL && (
              <button
                onClick={() => setSelectedLang('nl')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'nl'
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-orange-100 border-2 border-gray-200'
                }`}
              >
                🇳🇱 NL
              </button>
            )}
            {question.textFR && (
              <button
                onClick={() => setSelectedLang('fr')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'fr'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-blue-100 border-2 border-gray-200'
                }`}
              >
                🇫🇷 FR
              </button>
            )}
            {question.textAR && (
              <button
                onClick={() => setSelectedLang('ar')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'ar'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-green-100 border-2 border-gray-200'
                }`}
              >
                🇸🇦 AR
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <p className={`text-xl text-gray-800 leading-relaxed ${selectedLang === 'ar' ? 'text-right' : 'text-left'}`}>
          {getQuestionText()}
        </p>
      </div>
    </div>
  );
}

// Component for Explanation with Language Buttons
function ExplanationWithLanguages({ question, lang }: { question: Question; lang: string }) {
  const [selectedLang, setSelectedLang] = useState<'nl' | 'fr' | 'ar'>('nl');

  const getExplanationText = () => {
    if (selectedLang === 'nl' && question.explanationNL) return question.explanationNL;
    if (selectedLang === 'fr' && question.explanationFR) return question.explanationFR;
    if (selectedLang === 'ar' && question.explanationAR) return question.explanationAR;
    return question.explanationNL || question.explanationFR || question.explanationAR || '';
  };

  const hasMultipleLanguages = [question.explanationNL, question.explanationFR, question.explanationAR].filter(Boolean).length > 1;

  return (
    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {lang === "ar" ? "الشرح" : lang === "nl" ? "Uitleg" : "Explication"}
        </h3>
        
        {/* Language Buttons */}
        {hasMultipleLanguages && (
          <div className="flex gap-2">
            {question.explanationNL && (
              <button
                onClick={() => setSelectedLang('nl')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'nl'
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-orange-100 border-2 border-gray-200'
                }`}
              >
                🇳🇱 NL
              </button>
            )}
            {question.explanationFR && (
              <button
                onClick={() => setSelectedLang('fr')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'fr'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-blue-100 border-2 border-gray-200'
                }`}
              >
                🇫🇷 FR
              </button>
            )}
            {question.explanationAR && (
              <button
                onClick={() => setSelectedLang('ar')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === 'ar'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-green-100 border-2 border-gray-200'
                }`}
              >
                🇸🇦 AR
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <p className={`text-lg text-gray-700 leading-relaxed ${selectedLang === 'ar' ? 'text-right' : 'text-left'}`}>
          {getExplanationText()}
        </p>
      </div>
    </div>
  );
}

function LessonViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const category = searchParams.get("category");
  const lessonId = searchParams.get("lessonId");
  const email = searchParams.get("email");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // انتظر 300ms بعد آخر كتابة

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    const fetchQuestions = async () => {
      try {
        const url = `/api/questions?lessonId=${lessonId}`;
        console.log("🔍 Fetching questions from:", url);
        const res = await fetch(url);
        const data = await res.json();
        console.log("📚 Questions response:", data);

        if (data.success) {
          setQuestions(data.questions);
          setFilteredQuestions(data.questions);
          setLessonTitle(data.lesson?.title || "");
          console.log(`✅ Loaded ${data.questions.length} questions for lesson: ${data.lesson?.title}`);
        } else {
          console.error("❌ Failed to fetch questions:", data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && !isExpired && !checking) {
      fetchQuestions();
    }
  }, [lessonId, isExpired, checking]);

  // Filter questions based on search term - مُحسّن مع debounce
  useEffect(() => {
    if (!questions || questions.length === 0) {
      return;
    }

    if (debouncedSearchTerm.trim() === "") {
      setFilteredQuestions(questions);
      return;
    }

    try {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const filtered = questions.filter(q => {
        if (!q) return false;
        
        return (
          (q.text && q.text.toLowerCase().includes(searchLower)) ||
          (q.textNL && q.textNL.toLowerCase().includes(searchLower)) ||
          (q.textFR && q.textFR.toLowerCase().includes(searchLower)) ||
          (q.textAR && q.textAR.toLowerCase().includes(searchLower)) ||
          (q.explanationNL && q.explanationNL.toLowerCase().includes(searchLower)) ||
          (q.explanationFR && q.explanationFR.toLowerCase().includes(searchLower)) ||
          (q.explanationAR && q.explanationAR.toLowerCase().includes(searchLower))
        );
      });
      
      setFilteredQuestions(filtered);
      setCurrentIndex(0);
    } catch (error) {
      console.error("❌ Error filtering questions:", error);
      setFilteredQuestions(questions);
    }
  }, [debouncedSearchTerm, questions]);

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // حساب السؤال الحالي مع حماية
  const currentQuestion = useMemo(() => {
    if (!filteredQuestions || filteredQuestions.length === 0) {
      return null;
    }
    if (currentIndex < 0 || currentIndex >= filteredQuestions.length) {
      return filteredQuestions[0];
    }
    return filteredQuestions[currentIndex];
  }, [filteredQuestions, currentIndex]);

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
            onClick={() => router.back()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "العودة للدروس" : lang === "nl" ? "Terug naar lessen" : "Retour aux leçons"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {lang === "ar" ? "لا توجد نتائج" : lang === "nl" ? "Geen resultaten" : "Aucun résultat"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "ar" ? "لم يتم العثور على أسئلة تطابق بحثك" : lang === "nl" ? "Er zijn geen vragen gevonden die overeenkomen met je zoekopdracht" : "Aucune question ne correspond à votre recherche"}
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "مسح البحث" : lang === "nl" ? "Zoekopdracht wissen" : "Effacer la recherche"}
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
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">{lessonTitle || `${lang === "ar" ? "الدرس" : lang === "nl" ? "Les" : "Leçon"} ${lessonId}`}</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                {lang === "ar" ? `السؤال ${currentIndex + 1} من ${filteredQuestions.length}` : lang === "nl" ? `Vraag ${currentIndex + 1} van ${filteredQuestions.length}` : `Question ${currentIndex + 1} sur ${filteredQuestions.length}`}
              </p>
              {questions.length !== filteredQuestions.length && (
                <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
                  {lang === "ar" ? `${filteredQuestions.length} من ${questions.length}` : lang === "nl" ? `${filteredQuestions.length} van ${questions.length}` : `${filteredQuestions.length} sur ${questions.length}`}
                </span>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث في الأسئلة..." : lang === "nl" ? "Zoek in vragen..." : "Rechercher dans les questions..."}
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm !== debouncedSearchTerm ? (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <svg className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600">
                {debouncedSearchTerm === searchTerm ? (
                  filteredQuestions.length === 0 ? (
                    <span className="text-red-500">
                      {lang === "ar" ? "لا توجد نتائج" : lang === "nl" ? "Geen resultaten" : "Aucun résultat"}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {lang === "ar" 
                        ? `تم العثور على ${filteredQuestions.length} من ${questions.length} سؤال`
                        : lang === "nl"
                        ? `${filteredQuestions.length} van ${questions.length} vragen gevonden`
                        : `${filteredQuestions.length} sur ${questions.length} questions trouvées`
                      }
                    </span>
                  )
                ) : (
                  <span className="text-gray-400">
                    {lang === "ar" ? "جاري البحث..." : lang === "nl" ? "Zoeken..." : "Recherche..."}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            {/* Question Number Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {currentIndex + 1}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {lang === "ar" ? "السؤال" : lang === "nl" ? "Vraag" : "Question"}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {currentIndex + 1} / {filteredQuestions.length}
                </p>
              </div>
            </div>

            {/* Images - في الأول */}
            {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Question image ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-2xl border-4 border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                  />
                ))}
              </div>
            )}

            {/* Audio */}
            {currentQuestion.audioUrl && (
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border-2 border-purple-200">
                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  {lang === "ar" ? "الملف الصوتي" : lang === "nl" ? "Audio" : "Audio"}
                </p>
                <audio controls className="w-full">
                  <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {/* Question Text with Language Buttons */}
            <QuestionWithLanguages question={currentQuestion} lang={lang} />

            {/* Explanations with Language Buttons */}
            {(currentQuestion.explanationNL || currentQuestion.explanationFR || currentQuestion.explanationAR) && (
              <ExplanationWithLanguages question={currentQuestion} lang={lang} />
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
              disabled={currentIndex === filteredQuestions.length - 1}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                currentIndex === filteredQuestions.length - 1
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

export default function LessonViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl font-bold">Loading...</div></div>}>
      <LessonViewContent />
    </Suspense>
  );
}
