"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

interface Question {
  id: number;
  text: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  imageUrls?: string[];  // legacy - mapped to videoUrls
  videoUrls?: string[];
  audioUrl?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
}

// Component for Question with Auto-Translation
function QuestionWithLanguages({ question, lang }: { question: Question; lang: string }) {
  const originalText = question.textNL || question.textFR || question.textAR || question.text || "";
  const [translatedText, setTranslatedText] = useState(originalText);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!originalText || lang === "nl") { setTranslatedText(originalText); return; }
    const cacheKey = `${originalText}__${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setTranslatedText(cached); return; }

    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: originalText, targetLang: lang }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          sessionStorage.setItem(cacheKey, data.translated);
          setTranslatedText(data.translated);
        }
      })
      .finally(() => setTranslating(false));
  }, [originalText, lang]);

  return (
    <div className="mb-4">
      <h3 className="text-xs font-black text-[#003399] uppercase tracking-wider mb-2 flex items-center gap-1">
        <span className="w-1 h-4 bg-[#003399] rounded-full inline-block"></span>
        {lang === "ar" ? "السؤال" : lang === "nl" ? "Vraag" : lang === "fr" ? "Question" : "Question"}
        {translating && <span className="text-xs text-blue-400 animate-pulse ml-2">...</span>}
      </h3>
      <p className={`text-lg font-bold text-gray-900 leading-relaxed ${lang === "ar" ? "text-right" : "text-left"}`}>
        {translatedText}
      </p>
    </div>
  );
}

// Component for Explanation with Auto-Translation
function ExplanationWithLanguages({ question, lang }: { question: Question; lang: string }) {
  const originalText = question.explanationNL || question.explanationFR || question.explanationAR || "";
  const [translatedText, setTranslatedText] = useState(originalText);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!originalText || lang === "nl") { setTranslatedText(originalText); return; }
    const cacheKey = `exp__${originalText}__${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setTranslatedText(cached); return; }

    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: originalText, targetLang: lang }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          sessionStorage.setItem(cacheKey, data.translated);
          setTranslatedText(data.translated);
        }
      })
      .finally(() => setTranslating(false));
  }, [originalText, lang]);

  if (!originalText) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h3 className="text-xs font-black text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
        <span className="w-1 h-4 bg-green-500 rounded-full inline-block"></span>
        {lang === "ar" ? "الشرح" : lang === "nl" ? "Uitleg" : lang === "fr" ? "Explication" : "Explanation"}
        {translating && <span className="text-xs text-green-400 animate-pulse ml-2">...</span>}
      </h3>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className={`text-sm text-green-900 leading-relaxed ${lang === "ar" ? "text-right" : "text-left"}`}>
          {translatedText}
        </p>
      </div>
    </div>
  );
}

function LessonViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
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

  // ترجمة عنوان الدرس
  const translatedLessonTitles = useAutoTranslateList(lessonTitle ? [lessonTitle] : [], lang);
  const translatedLessonTitle = translatedLessonTitles[0] || lessonTitle;
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

            <h1 className="text-2xl font-bold text-gray-800 mb-2">{translatedLessonTitle || `${lang === "ar" ? "الدرس" : lang === "nl" ? "Les" : "Leçon"} ${lessonId}`}</h1>
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

          {/* 10 أسئلة في نفس الصفحة */}
          <div className="space-y-4">
            {filteredQuestions.slice(currentIndex, currentIndex + 1).map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={currentIndex + i}
                total={filteredQuestions.length}
                lang={lang}
                onNext={() => {}}
                onPrev={() => {}}
              />
            ))}
          </div>

          {/* أزرار التنقل بين الصفحات */}
          {filteredQuestions.length > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex === 0}
                className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex === 0 ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"}`}
              >
                ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : "Previous"}
              </button>
              <span className="text-sm text-gray-500 font-bold">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
              <button
                onClick={() => { setCurrentIndex(Math.min(filteredQuestions.length - 1, currentIndex + 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex + 1 >= filteredQuestions.length}
                className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex + 1 >= filteredQuestions.length ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-white border-[#003399] hover:opacity-90"}`}
                style={currentIndex + 1 <= filteredQuestions.length - 1 ? { background: "linear-gradient(135deg, #003399, #0055cc)" } : {}}
              >
                {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : "Next"} →
              </button>
            </div>
          )}
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
