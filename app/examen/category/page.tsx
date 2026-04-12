"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";

function ExamenCategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const cat = searchParams.get("cat") || "B";
  const email = searchParams.get("email") || "";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const lessonsRes = await fetch(`/api/lessons?category=${cat.toUpperCase()}`);
        const lessonsData = await lessonsRes.json();
        if (!lessonsData.success) { setLoading(false); return; }

        const allQ: any[] = [];
        for (const lesson of lessonsData.lessons) {
          const qRes = await fetch(`/api/exam-questions?lessonId=${lesson.id}`);
          const qData = await qRes.json();
          if (qData.success && qData.questions?.length > 0) {
            allQ.push(...qData.questions);
          }
        }
        // خلط الأسئلة عشوائياً
        setQuestions(allQ.sort(() => Math.random() - 0.5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [cat]);

  // مؤقت 15 ثانية
  useEffect(() => {
    if (!started || finished || locked) return;
    setTimeLeft(15);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setLocked(true);
          // إذا لم يختر إجابة، يُسجل null (خسارة)
          setAnswers(a => ({ ...a, [currentIndex]: a[currentIndex] ?? null }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [currentIndex, started, finished]);

  const handleAnswer = (num: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    clearInterval(timerRef.current!);
    setAnswers(a => ({ ...a, [currentIndex]: num }));
    setLocked(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setLocked(false);
    }
  };

  const score = Object.entries(answers).filter(([i, ans]) =>
    ans !== null && questions[parseInt(i)]?.correctAnswer === ans
  ).length;

  const q = questions[currentIndex];
  const isRtl = lang === "ar";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // صفحة البداية
  if (!started) return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="border-4 border-[#003399] rounded-2xl p-10">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-black text-[#003399] mb-2 uppercase">
            {lang === "ar" ? `امتحان الفئة ${cat}` : lang === "nl" ? `Examen Categorie ${cat}` : `Exam Category ${cat}`}
          </h1>
          <p className="text-gray-500 mb-2">{questions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}</p>
          <p className="text-sm text-orange-600 font-bold mb-8">
            ⏱ {lang === "ar" ? "15 ثانية لكل سؤال" : lang === "nl" ? "15 seconden per vraag" : "15 seconds per question"}
          </p>
          {questions.length === 0 ? (
            <p className="text-red-500 font-bold">{lang === "ar" ? "لا توجد أسئلة بعد" : "Geen vragen beschikbaar"}</p>
          ) : (
            <button onClick={() => setStarted(true)}
              className="px-10 py-4 font-black text-white text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              {lang === "ar" ? "ابدأ الامتحان" : lang === "nl" ? "Start Examen" : "Start Exam"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // صفحة النتيجة
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className={`border-4 rounded-2xl p-10 ${passed ? "border-green-500" : "border-red-500"}`}>
            <div className="text-7xl mb-4">{passed ? "🏆" : "😔"}</div>
            <h1 className="text-3xl font-black mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {passed
                ? (lang === "ar" ? "مبروك! نجحت" : lang === "nl" ? "Gefeliciteerd! Geslaagd!" : "Congratulations! Passed!")
                : (lang === "ar" ? "لم تنجح هذه المرة" : lang === "nl" ? "Helaas niet geslaagd" : "Not passed this time")}
            </h1>
            <div className="text-6xl font-black my-6" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {score} / {questions.length}
            </div>
            <div className="text-2xl font-bold text-gray-600 mb-8">{pct}%</div>

            {/* تفاصيل الإجابات */}
            <div className="text-left mt-6 space-y-2 max-h-64 overflow-y-auto">
              {questions.map((q, i) => {
                const userAns = answers[i];
                const correct = q.correctAnswer === userAns;
                return (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded text-sm ${correct ? "bg-green-50" : "bg-red-50"}`}>
                    <span>{correct ? "✅" : "❌"}</span>
                    <span className="flex-1 truncate text-gray-700">{q.textNL || q.text}</span>
                    {!correct && userAns === null && <span className="text-orange-500 text-xs font-bold">⏱ {lang === "ar" ? "انتهى الوقت" : "Tijd op"}</span>}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8 justify-center">
              <button onClick={() => { setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); setQuestions(q => [...q].sort(() => Math.random() - 0.5)); }}
                className="px-6 py-3 font-black text-white rounded-xl"
                style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                🔄 {lang === "ar" ? "إعادة" : lang === "nl" ? "Opnieuw" : "Retry"}
              </button>
              <button onClick={() => router.back()}
                className="px-6 py-3 font-black border-2 border-gray-400 text-gray-600 rounded-xl hover:bg-gray-50">
                ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة السؤال
  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* شريط التقدم */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-500">{currentIndex + 1} / {questions.length}</span>
          <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
            <div className="bg-[#003399] h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          <span className="text-sm font-bold text-gray-500">
            {lang === "ar" ? "النقاط:" : lang === "nl" ? "Score:" : "Score:"} {score}
          </span>
        </div>

        {/* المؤقت */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 transition-all ${
            timeLeft <= 5 ? "border-red-500 text-red-500 animate-pulse" :
            timeLeft <= 10 ? "border-orange-500 text-orange-500" :
            "border-[#003399] text-[#003399]"
          }`}>
            {locked ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "✅" : "❌") : "⏱") : timeLeft}
          </div>
        </div>

        {/* السؤال */}
        {q && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* رأس السؤال */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              <span className="text-white font-black text-sm">
                {lang === "ar" ? "السؤال" : lang === "nl" ? "Vraag" : "Question"} {currentIndex + 1}
              </span>
            </div>

            {/* الصور */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div className={`grid gap-1 bg-gray-900 p-2 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                  <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
                    <img src={url} alt="" className="w-full h-full object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
                    {/* watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img src="/logo.jpg" alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 0.35, mixBlendMode: 'luminosity' }} draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* نص السؤال */}
            <div className="px-5 py-4 bg-white">
              <p className={`text-lg font-bold text-gray-900 leading-relaxed mb-5 ${isRtl ? "text-right" : "text-left"}`}>
                {q.textNL || q.text}
              </p>

              {/* الإجابات */}
              <div className="space-y-3">
                {[1, 2, 3].map(num => {
                  const ansText = q[`answer${num}`];
                  if (!ansText) return null;
                  const isCorrect = q.correctAnswer === num;
                  const isSelected = userAnswer === num;

                  let style = "bg-white border-2 border-gray-300 text-gray-800 hover:border-[#003399]";
                  if (isAnswered || locked) {
                    if (isCorrect) style = "bg-green-50 border-2 border-green-500 text-green-800";
                    else if (isSelected && !isCorrect) style = "bg-red-50 border-2 border-red-500 text-red-800";
                    else style = "bg-gray-50 border-2 border-gray-200 text-gray-500";
                  }

                  return (
                    <button key={num} onClick={() => handleAnswer(num)}
                      disabled={isAnswered || locked}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${style} ${!isAnswered && !locked ? "cursor-pointer active:scale-98" : "cursor-default"}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isAnswered || locked
                          ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                          : "bg-[#003399] text-white"
                      }`}>
                        {isAnswered || locked ? (isCorrect ? "✓" : isSelected ? "✗" : num) : num}
                      </span>
                      <span className={isRtl ? "text-right flex-1" : "text-left flex-1"}>{ansText}</span>
                    </button>
                  );
                })}
              </div>

              {/* زر التالي */}
              {(isAnswered || locked) && (
                <button onClick={handleNext}
                  className="w-full mt-5 py-3 font-black text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                  {currentIndex + 1 >= questions.length
                    ? (lang === "ar" ? "عرض النتيجة 🏆" : lang === "nl" ? "Resultaat bekijken 🏆" : "View Result 🏆")
                    : (lang === "ar" ? "التالي ←" : lang === "nl" ? "Volgende →" : "Next →")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamenCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ExamenCategoryContent />
    </Suspense>
  );
}
