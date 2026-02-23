"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import { FaTrophy, FaCalendar, FaCheckCircle, FaTimesCircle, FaChartLine } from "react-icons/fa";

interface ExamResult {
  id: number;
  lessonTitle: string;
  category: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  answers: Array<{
    questionId: number;
    questionText: string;
    imageUrls: string[];
    audioUrl: string | null;
    answer1?: string;
    answer2?: string;
    answer3?: string;
    correctAnswer?: number;
    userAnswer: number | null;
    isCorrect: boolean;
  }>;
}

export default function ResultsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      router.push("/");
      return;
    }
    fetchResults(email);
  }, [router]);

  const fetchResults = async (email: string) => {
    try {
      const response = await fetch(`/api/exam-results?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-EG" : lang === "nl" ? "nl-NL" : "fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => r.passed).length,
    avgScore: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) 
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              {lang === "ar" ? "جاري التحميل..." : lang === "nl" ? "Laden..." : "Chargement..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
          </button>

          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {lang === "ar" ? "نتائج الامتحانات" : lang === "nl" ? "Examenresultaten" : "Résultats d'examens"}
          </h1>
          <p className="text-gray-600">
            {lang === "ar" ? "جميع نتائج امتحاناتك السابقة" : lang === "nl" ? "Al je eerdere examenresultaten" : "Tous vos résultats d'examens précédents"}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  {lang === "ar" ? "المجموع" : lang === "nl" ? "Totaal" : "Total"}
                </p>
                <p className="text-3xl font-black text-blue-700">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <FaCheckCircle className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  {lang === "ar" ? "نجح" : lang === "nl" ? "Geslaagd" : "Réussi"}
                </p>
                <p className="text-3xl font-black text-green-700">{stats.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-6 border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <FaTimesCircle className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  {lang === "ar" ? "رسب" : lang === "nl" ? "Gezakt" : "Échoué"}
                </p>
                <p className="text-3xl font-black text-red-700">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <FaTrophy className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  {lang === "ar" ? "المعدل" : lang === "nl" ? "Gemiddelde" : "Moyenne"}
                </p>
                <p className="text-3xl font-black text-orange-700">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FaTrophy className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lang === "ar" ? "لا توجد نتائج بعد" : lang === "nl" ? "Nog geen resultaten" : "Pas encore de résultats"}
            </h2>
            <p className="text-gray-600 mb-6">
              {lang === "ar" ? "ابدأ بإجراء امتحان لرؤية نتائجك هنا" : lang === "nl" ? "Begin met een examen om je resultaten hier te zien" : "Commencez un examen pour voir vos résultats ici"}
            </p>
            <button
              onClick={() => router.push("/examen")}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg"
            >
              {lang === "ar" ? "ابدأ امتحان" : lang === "nl" ? "Start examen" : "Commencer un examen"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className={`bg-white rounded-3xl shadow-lg p-6 border-3 transition-all hover:shadow-xl cursor-pointer ${
                  result.passed 
                    ? "border-green-200 hover:border-green-400" 
                    : "border-red-200 hover:border-red-400"
                }`}
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      result.passed 
                        ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                        : "bg-gradient-to-br from-red-500 to-pink-600"
                    }`}>
                      {result.passed ? (
                        <FaCheckCircle className="text-3xl text-white" />
                      ) : (
                        <FaTimesCircle className="text-3xl text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{result.lessonTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendar />
                          {formatDate(result.completedAt)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full font-semibold">
                          {lang === "ar" ? "فئة" : lang === "nl" ? "Categorie" : "Catégorie"} {result.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        {lang === "ar" ? "النتيجة" : lang === "nl" ? "Score" : "Score"}
                      </p>
                      <p className="text-2xl font-black text-gray-800">
                        {result.score}/{result.totalQuestions}
                      </p>
                    </div>

                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      result.passed 
                        ? "bg-green-100" 
                        : "bg-red-100"
                    }`}>
                      <span className={`text-3xl font-black ${
                        result.passed ? "text-green-700" : "text-red-700"
                      }`}>
                        {Math.round(result.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedResult && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedResult(null)}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 rounded-t-3xl sticky top-0 z-10 ${
                selectedResult.passed 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                  : "bg-gradient-to-r from-red-500 to-pink-600"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-white">
                    {lang === "ar" ? "تفاصيل الامتحان" : lang === "nl" ? "Examendetails" : "Détails de l'examen"}
                  </h2>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                    {selectedResult.passed ? (
                      <FaCheckCircle className="text-4xl text-white" />
                    ) : (
                      <FaTimesCircle className="text-4xl text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-semibold mb-1">
                      {selectedResult.passed 
                        ? (lang === "ar" ? "نجح" : lang === "nl" ? "Geslaagd" : "Réussi")
                        : (lang === "ar" ? "رسب" : lang === "nl" ? "Gezakt" : "Échoué")
                      }
                    </p>
                    <p className="text-white text-3xl font-black">
                      {Math.round(selectedResult.percentage)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Lesson Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {lang === "ar" ? "معلومات الدرس" : lang === "nl" ? "Les informatie" : "Informations sur la leçon"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">
                        {lang === "ar" ? "عنوان الدرس:" : lang === "nl" ? "Les titel:" : "Titre de la leçon:"}
                      </span>
                      <span className="text-gray-800 font-bold">{selectedResult.lessonTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">
                        {lang === "ar" ? "الفئة:" : lang === "nl" ? "Categorie:" : "Catégorie:"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                        {selectedResult.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">
                        {lang === "ar" ? "التاريخ:" : lang === "nl" ? "Datum:" : "Date:"}
                      </span>
                      <span className="text-gray-800 font-bold flex items-center gap-2">
                        <FaCalendar className="text-gray-500" />
                        {formatDate(selectedResult.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {lang === "ar" ? "ملخص النتيجة" : lang === "nl" ? "Score samenvatting" : "Résumé du score"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {lang === "ar" ? "صحيح" : lang === "nl" ? "Correct" : "Correct"}
                      </p>
                      <p className="text-3xl font-black text-green-600">{selectedResult.score}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {lang === "ar" ? "خاطئ" : lang === "nl" ? "Fout" : "Incorrect"}
                      </p>
                      <p className="text-3xl font-black text-red-600">
                        {selectedResult.totalQuestions - selectedResult.score}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {lang === "ar" ? "المجموع" : lang === "nl" ? "Totaal" : "Total"}
                      </p>
                      <p className="text-3xl font-black text-blue-600">{selectedResult.totalQuestions}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {lang === "ar" ? "النسبة" : lang === "nl" ? "Percentage" : "Pourcentage"}
                      </p>
                      <p className={`text-3xl font-black ${
                        selectedResult.passed ? "text-green-600" : "text-red-600"
                      }`}>
                        {Math.round(selectedResult.percentage)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions and Answers */}
                {selectedResult.answers && selectedResult.answers.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {lang === "ar" ? "الأسئلة والأجوبة" : lang === "nl" ? "Vragen en antwoorden" : "Questions et réponses"}
                    </h3>
                    <div className="space-y-4">
                      {selectedResult.answers.map((answer, index) => (
                      <div
                        key={answer.questionId}
                        className={`rounded-2xl border-3 p-6 ${
                          answer.isCorrect
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                        style={{ borderWidth: '3px' }}
                      >
                        {/* Question Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                            answer.isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                              answer.isCorrect 
                                ? "bg-green-200 text-green-800" 
                                : "bg-red-200 text-red-800"
                            }`}>
                              {answer.isCorrect 
                                ? (lang === "ar" ? "✓ صحيح" : lang === "nl" ? "✓ Correct" : "✓ Correct")
                                : (lang === "ar" ? "✗ خاطئ" : lang === "nl" ? "✗ Fout" : "✗ Incorrect")
                              }
                            </span>
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-lg text-gray-800 font-medium mb-4">{answer.questionText}</p>

                        {/* Images */}
                        {answer.imageUrls && answer.imageUrls.length > 0 && (
                          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {answer.imageUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Question ${index + 1} image ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                              />
                            ))}
                          </div>
                        )}

                        {/* Audio */}
                        {answer.audioUrl && (
                          <div className="mb-4">
                            <audio controls className="w-full">
                              <source src={answer.audioUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}

                        {/* Answers */}
                        <div className="space-y-2">
                          {[1, 2, 3].map((num) => {
                            const answerKey = `answer${num}` as 'answer1' | 'answer2' | 'answer3';
                            const answerText = answer[answerKey];
                            
                            if (!answerText) return null;

                            const isUserAnswer = answer.userAnswer === num;
                            const isCorrectAnswer = answer.correctAnswer === num;

                            return (
                              <div
                                key={num}
                                className={`p-4 rounded-xl border-2 ${
                                  isCorrectAnswer
                                    ? "bg-green-100 border-green-400"
                                    : isUserAnswer && !isCorrectAnswer
                                    ? "bg-red-100 border-red-400"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                    isCorrectAnswer
                                      ? "bg-green-500 text-white"
                                      : isUserAnswer && !isCorrectAnswer
                                      ? "bg-red-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}>
                                    {isCorrectAnswer ? (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : isUserAnswer && !isCorrectAnswer ? (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      num
                                    )}
                                  </div>
                                  <span className={`flex-1 font-semibold ${
                                    isCorrectAnswer
                                      ? "text-green-800"
                                      : isUserAnswer && !isCorrectAnswer
                                      ? "text-red-800"
                                      : "text-gray-700"
                                  }`}>
                                    {answerText}
                                  </span>
                                  {isUserAnswer && (
                                    <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                      {lang === "ar" ? "إجابتك" : lang === "nl" ? "Jouw antwoord" : "Votre réponse"}
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                                      {lang === "ar" ? "الإجابة الصحيحة" : lang === "nl" ? "Juiste antwoord" : "Bonne réponse"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedResult(null)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg"
                >
                  {lang === "ar" ? "إغلاق" : lang === "nl" ? "Sluiten" : "Fermer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
