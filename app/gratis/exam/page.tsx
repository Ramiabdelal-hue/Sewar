"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import WatermarkedImage from "@/components/WatermarkedImage";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";
import Footer from "@/components/Footer";

function GratisExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const category = searchParams.get("category") || "B";
  const group = searchParams.get("group") || "0";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [locked, setLocked] = useState(false);

  const isRtl = lang === "ar";

  useEffect(() => {
    fetch(`/api/free-content?category=${category}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const examGroup = d.examGroups.find((g: any) => g.group === Number(group));
          if (examGroup) {
            setQuestions(examGroup.questions);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, group]);

  const q = questions[currentIndex];
  const textsToTranslate = q ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  const handleAnswer = (answerIndex: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: answerIndex }));
    setLocked(true);
    setTimeout(() => setLocked(false), 2000);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

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
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-bold text-gray-700 mb-4">
            {lang === "ar" ? "لا توجد أسئلة امتحان مجانية" : lang === "nl" ? "Geen gratis examenvragen" : "No free exam questions"}
          </p>
          <button onClick={() => router.back()} className="px-6 py-2 rounded-xl font-bold text-white" style={{ background: "#22c55e" }}>
            {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Retour"}
          </button>
        </div>
      </div>
    </div>
  );

  if (!started) return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            {group === "0" ? 
              (lang === "ar" ? "امتحان مجاني" : lang === "nl" ? "Gratis Examen" : "Free Exam") :
              `Examen ${group}`
            }
          </h2>
          <p className="text-gray-600 mb-6">
            {questions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}
          </p>
          <button 
            onClick={() => setStarted(true)}
            className="w-full py-4 font-black text-white text-lg rounded-xl hover:scale-105 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            🚀 {lang === "ar" ? "ابدأ الامتحان" : lang === "nl" ? "Start Examen" : "Start Exam"}
          </button>
        </div>
      </div>
    </div>
  );

  if (finished) {
    const results = calculateResults();
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              {lang === "ar" ? "نتائج الامتحان" : lang === "nl" ? "Examenresultaten" : "Exam Results"}
            </h2>
            <div className="text-4xl font-black mb-4" style={{ color: results.percentage >= 70 ? "#22c55e" : "#ef4444" }}>
              {results.percentage}%
            </div>
            <p className="text-gray-600 mb-6">
              {results.correct} / {results.total} {lang === "ar" ? "صحيح" : lang === "nl" ? "correct" : "correct"}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); }}
                className="flex-1 py-3 font-black text-white rounded-xl hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                🔄 {lang === "ar" ? "إعادة المحاولة" : lang === "nl" ? "Opnieuw" : "Retry"}
              </button>
              <button 
                onClick={() => router.back()}
                className="flex-1 py-3 font-black border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95">
                ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
              </button>
            </div>
            <div className="mt-4">
              <button onClick={() => router.push("/theorie")}
                className="w-full py-3 font-black text-sm rounded-xl transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)", color: "#0a0a0a" }}>
                🔓 {lang === "ar" ? "اشترك للمزيد" : lang === "nl" ? "Meer? Inschrijven" : "More? Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"} style={{ background: "#f0f0f0" }}>
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
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">🎯 Gratis Examen</p>
              <h1 className="text-base font-black text-white">
                {group === "0" ? 
                  (lang === "ar" ? "امتحان مجاني" : lang === "nl" ? "Gratis Examen" : "Free Exam") :
                  `Examen ${group}`
                }
              </h1>
            </div>
            <span className="ml-auto px-3 py-1 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 max-w-2xl md:max-w-4xl mx-auto w-full px-4 py-4">
        {q && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
                {currentIndex + 1}
              </div>
              <p className={`text-sm font-black text-white leading-snug flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                {translatedTexts[0] || q.textNL || q.text}
              </p>
              <span className="text-white/50 text-xs font-bold flex-shrink-0">{currentIndex + 1} / {questions.length}</span>
            </div>

            {/* Images */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div>
                <div className={`grid gap-1 p-2 bg-gray-100 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                    <WatermarkedImage key={i} src={url} alt="" />
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {q.audioUrl && (
              <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                <audio controls className="w-full h-9">
                  <source src={q.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {/* Answers */}
            <div className="px-5 py-5 bg-white">
              <div className="space-y-3">
                {[1, 2, 3].map(num => {
                  const answerText = translatedTexts[num] || (num === 1 ? q.answer1 : num === 2 ? q.answer2 : q.answer3);
                  if (!answerText) return null;

                  const isSelected = userAnswer === num;
                  const isCorrect = q.correctAnswer === num;
                  
                  let style = "";
                  if (isAnswered) {
                    if (isCorrect) style = "bg-green-100 border-green-400 text-green-800";
                    else if (isSelected) style = "bg-red-100 border-red-400 text-red-800";
                    else style = "bg-gray-50 border-gray-200 text-gray-500";
                  } else if (locked) {
                    style = "bg-gray-50 border-gray-200 text-gray-400";
                  } else {
                    style = "bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-300";
                  }

                  return (
                    <button key={num} onClick={() => handleAnswer(num)} disabled={isAnswered || locked}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${style} ${!isAnswered && !locked ? "cursor-pointer active:scale-95" : "cursor-default"}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isAnswered ? 
                          isCorrect ? "bg-green-500 text-white" : 
                          isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                        : locked ? "bg-gray-200 text-gray-400" : "bg-[#22c55e] text-white"
                      }`}>
                        {String.fromCharCode(64 + num)}
                      </span>
                      <span className="flex-1 text-left">{answerText}</span>
                      {isAnswered && isCorrect && <span className="text-green-600">✓</span>}
                      {isAnswered && isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                    </button>
                  );
                })}
              </div>
              {(isAnswered || locked) && (
                <button onClick={handleNext} className="w-full mt-5 py-3 font-black text-white rounded-xl hover:opacity-90 active:scale-95" 
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  {currentIndex + 1 >= questions.length ? 
                    (lang === "ar" ? "عرض النتائج 🏆" : lang === "nl" ? "Resultaat 🏆" : "Result 🏆") : 
                    (lang === "ar" ? "التالي ➤" : lang === "nl" ? "Volgende ➤" : "Next ➤")
                  }
                </button>
              )}
            </div>
          </div>
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

export default function GratisExamPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div></div>}>
      <GratisExamContent />
    </Suspense>
  );
}