"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";

// زر القراءة الصوتية
function TTSButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);

  const speak = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const doSpeak = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.lang = "nl-NL";
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang === "nl-NL" && !v.name.includes("Xander")) || voices.find(v => v.lang.startsWith("nl"));
      if (v) u.voice = v;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    };
    if (window.speechSynthesis.getVoices().length === 0) { window.speechSynthesis.onvoiceschanged = doSpeak; } else { doSpeak(); }
  };

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <button onClick={speak}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${speaking ? "bg-red-500 text-white border-red-500" : "bg-white text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"}`}>
        {speaking ? "⏹ Stop" : "🔊 Lees voor"}
      </button>
      <div className="flex gap-1">
        {[0.5, 0.75, 1, 1.25, 1.5].map(r => (
          <button key={r} onClick={() => { setRate(r); if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); } }}
            className={`px-2 py-0.5 text-xs font-black rounded border transition-all ${rate === r ? "bg-[#003399] text-white border-[#003399]" : "bg-white text-gray-500 border-gray-300"}`}>
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}

function ExamenCategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const cat = searchParams.get("cat") || "B";
  const email = searchParams.get("email") || "";
  const lessonId = searchParams.get("lessonId"); // إذا موجود يجلب درس محدد فقط

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRef = useRef<NodeJS.Timeout | null>(null);
  const [readingDone, setReadingDone] = useState(false);

  // قراءة تلقائية للسؤال والإجابات
  const speakQuestion = (q: any) => {
    if (!window.speechSynthesis || !q) return;
    window.speechSynthesis.cancel();
    setReadingDone(false);

    const getVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return voices.find(v => v.lang === "nl-NL" && !v.name.includes("Xander"))
        || voices.find(v => v.lang.startsWith("nl"))
        || null;
    };

    const speak = (text: string, onEnd?: () => void) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "nl-NL";
      u.rate = 0.9;
      const v = getVoice();
      if (v) u.voice = v;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
    };

    const questionText = q.textNL || q.text || "";
    const answersList = [q.answer1, q.answer2, q.answer3].filter(Boolean);

    // قراءة السؤال أولاً
    speak(questionText, () => {
      let i = 0;
      const readNext = () => {
        if (i >= answersList.length) {
          // انتهت القراءة → ابدأ العداد
          setReadingDone(true);
          return;
        }
        const label = i === 0 ? "Eerste antwoord:" : i === 1 ? "Tweede antwoord:" : "Derde antwoord:";
        speak(`${label} ${answersList[i]}`, () => {
          i++;
          ttsRef.current = setTimeout(readNext, 400);
        });
      };
      ttsRef.current = setTimeout(readNext, 500);
    });
  };

  // تشغيل القراءة بعد 3 ثوانٍ من كل سؤال جديد
  useEffect(() => {
    if (!started || finished) return;
    if (ttsRef.current) clearTimeout(ttsRef.current);
    window.speechSynthesis?.cancel();
    setReadingDone(false);

    ttsRef.current = setTimeout(() => {
      const q = questions[currentIndex];
      speakQuestion(q);
    }, 3000);

    return () => {
      if (ttsRef.current) clearTimeout(ttsRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [currentIndex, started, finished]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (lessonId) {
          const qRes = await fetch(`/api/exam-questions?lessonId=${lessonId}&category=${cat.toUpperCase()}`);
          const qData = await qRes.json();
          if (qData.success) setQuestions(qData.questions.sort(() => Math.random() - 0.5));
        } else {
          const lessonsRes = await fetch(`/api/lessons?category=${cat.toUpperCase()}`);
          const lessonsData = await lessonsRes.json();
          if (!lessonsData.success) { setLoading(false); return; }
          const allQ: any[] = [];
          for (const lesson of lessonsData.lessons) {
            const qRes = await fetch(`/api/exam-questions?lessonId=${lesson.id}&category=${cat.toUpperCase()}`);
            const qData = await qRes.json();
            if (qData.success && qData.questions?.length > 0) allQ.push(...qData.questions);
          }
          setQuestions(allQ.sort(() => Math.random() - 0.5));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [cat]);

  // مؤقت 15 ثانية - يبدأ فقط بعد انتهاء القراءة
  useEffect(() => {
    if (!started || finished || locked || !readingDone) return;
    setTimeLeft(15);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setLocked(true);
          setAnswers(a => ({ ...a, [currentIndex]: a[currentIndex] ?? null }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [currentIndex, started, finished, readingDone]);

  const handleAnswer = (num: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    clearInterval(timerRef.current!);
    window.speechSynthesis?.cancel();
    if (ttsRef.current) clearTimeout(ttsRef.current);
    setAnswers(a => ({ ...a, [currentIndex]: num }));
    setLocked(true);
  };

  const handleNext = () => {
    setReadingDone(false);
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setLocked(false);
    }
  };

  const score = Object.entries(answers).filter(([i, ans]) =>
    ans !== null && ans !== undefined && questions[parseInt(i)]?.correctAnswer === ans
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
    const wrongAnswers = questions.filter((q, i) => answers[i] !== q.correctAnswer);

    return (
      <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* بطاقة النتيجة */}
          <div className={`rounded-2xl p-8 mb-6 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
            <div className="text-6xl mb-3">{passed ? "🏆" : "😔"}</div>
            <h1 className="text-2xl font-black mb-1" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {passed
                ? (lang === "ar" ? "مبروك! نجحت" : lang === "nl" ? "Gefeliciteerd! Geslaagd!" : "Congratulations!")
                : (lang === "ar" ? "لم تنجح هذه المرة" : lang === "nl" ? "Helaas niet geslaagd" : "Not passed")}
            </h1>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="bg-white rounded-xl px-6 py-3 shadow">
                <p className="text-xs text-gray-400 font-bold uppercase">Correct</p>
                <p className="text-3xl font-black text-green-600">{score}</p>
              </div>
              <div className="bg-white rounded-xl px-6 py-3 shadow">
                <p className="text-xs text-gray-400 font-bold uppercase">Fout</p>
                <p className="text-3xl font-black text-red-500">{questions.length - score}</p>
              </div>
              <div className="bg-white rounded-xl px-6 py-3 shadow">
                <p className="text-xs text-gray-400 font-bold uppercase">Score</p>
                <p className="text-3xl font-black" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</p>
              </div>
            </div>
          </div>

          {/* مراجعة الأسئلة الخاطئة */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm">✗</span>
                {lang === "ar" ? `الأسئلة الخاطئة (${wrongAnswers.length})` : lang === "nl" ? `Foute antwoorden (${wrongAnswers.length})` : `Wrong answers (${wrongAnswers.length})`}
              </h2>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[i];
                  const isCorrect = userAns === q.correctAnswer;
                  if (isCorrect) return null;

                  const timedOut = userAns === null || userAns === undefined;

                  return (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow border border-red-100">
                      {/* رأس */}
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#fef2f2" }}>
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                        {timedOut && (
                          <span className="text-xs font-black text-orange-500 flex items-center gap-1">
                            ⏱ {lang === "ar" ? "انتهى الوقت" : lang === "nl" ? "Tijd verlopen" : "Time out"}
                          </span>
                        )}
                      </div>

                      {/* صورة */}
                      {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
                        <div className={`grid gap-0.5 bg-gray-900 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {q.videoUrls.filter(Boolean).map((url: string, idx: number) => (
                            <div key={idx} className="relative" style={{ aspectRatio: "16/9" }}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                <img src="/logo.jpg" alt="" style={{ width: '45%', height: '45%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-4">
                        {/* نص السؤال */}
                        <p className="font-bold text-gray-800 mb-4 text-sm leading-relaxed">{q.textNL || q.text}</p>

                        {/* الإجابات */}
                        <div className="space-y-2">
                          {[1, 2, 3].map(num => {
                            const ansText = q[`answer${num}`];
                            if (!ansText) return null;
                            const isCorrectAns = q.correctAnswer === num;
                            const isUserAns = userAns === num;

                            return (
                              <div key={num} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border-2 ${
                                isCorrectAns ? "bg-green-50 border-green-400 text-green-800" :
                                isUserAns ? "bg-red-50 border-red-400 text-red-800" :
                                "bg-gray-50 border-gray-200 text-gray-500"
                              }`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                  isCorrectAns ? "bg-green-500 text-white" :
                                  isUserAns ? "bg-red-500 text-white" :
                                  "bg-gray-300 text-gray-600"
                                }`}>
                                  {isCorrectAns ? "✓" : isUserAns ? "✗" : num}
                                </span>
                                <span className="flex-1">{ansText}</span>
                                {isCorrectAns && <span className="text-xs font-black text-green-600">{lang === "ar" ? "الصحيحة" : lang === "nl" ? "Correct" : "Correct"}</span>}
                                {isUserAns && !isCorrectAns && <span className="text-xs font-black text-red-500">{lang === "ar" ? "إجابتك" : lang === "nl" ? "Jouw antwoord" : "Your answer"}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* الأسئلة الصحيحة */}
          {score > 0 && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-black text-gray-500 flex items-center gap-2 mb-3 select-none">
                <span className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm">✓</span>
                {lang === "ar" ? `الأسئلة الصحيحة (${score})` : lang === "nl" ? `Goede antwoorden (${score})` : `Correct answers (${score})`}
              </summary>
              <div className="space-y-2 mt-2">
                {questions.map((q, i) => {
                  if (answers[i] !== q.correctAnswer) return null;
                  return (
                    <div key={i} className="bg-white rounded-xl px-4 py-3 border border-green-200 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-gray-700 flex-1 truncate">{q.textNL || q.text}</p>
                      <span className="text-green-500 font-black text-sm">✓</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* أزرار */}
          <div className="flex gap-3">
            <button onClick={() => { setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); setQuestions(q => [...q].sort(() => Math.random() - 0.5)); }}
              className="flex-1 py-3 font-black text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              🔄 {lang === "ar" ? "إعادة" : lang === "nl" ? "Opnieuw" : "Retry"}
            </button>
            <button onClick={() => router.back()}
              className="flex-1 py-3 font-black border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95">
              ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
            </button>
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

        {/* السؤال */}
        {q && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* رأس السؤال - العد + المؤقت */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              <span className="text-white font-black text-sm">
                {currentIndex + 1} / {questions.length}
              </span>

              {/* المؤقت بجانب رقم السؤال */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
                locked ? "bg-white/20 border-white/40 text-white" :
                !readingDone ? "bg-white/20 border-white/40 text-white" :
                timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse" :
                timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white" :
                "bg-white/20 border-white/40 text-white"
              }`}>
                <span>{!readingDone && !locked ? "🎧" : "⏱"}</span>
                <span className="text-lg">
                  {locked
                    ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "✅" : "❌") : "⏱")
                    : !readingDone ? "..." : timeLeft}
                </span>
                {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
              </div>
            </div>

            {/* الصور */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div className={`grid gap-1 bg-gray-900 p-2 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                  <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
                    <img src={url} alt="" className="w-full h-full object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
                    {/* watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <img src="/logo.jpg" alt="" style={{ width: '45%', height: '45%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }} draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* نص السؤال */}
            <div className="px-5 py-4 bg-white">
              {/* زر القراءة */}
              <TTSButton text={q.textNL || q.text} />

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
                    // فقط إذا اختار المستخدم إجابة نُظهر الصحيحة والخاطئة
                    if (isAnswered && userAnswer !== null) {
                      if (isCorrect) style = "bg-green-50 border-2 border-green-500 text-green-800";
                      else if (isSelected && !isCorrect) style = "bg-red-50 border-2 border-red-500 text-red-800";
                      else style = "bg-gray-50 border-2 border-gray-200 text-gray-500";
                    } else {
                      // انتهى الوقت بدون إجابة - كل الأزرار رمادية
                      style = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button key={num} onClick={() => handleAnswer(num)}
                      disabled={isAnswered || locked}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${style} ${!isAnswered && !locked ? "cursor-pointer active:scale-98" : "cursor-default"}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isAnswered && userAnswer !== null
                          ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                          : locked
                          ? "bg-gray-200 text-gray-400"
                          : "bg-[#003399] text-white"
                      }`}>
                        {isAnswered && userAnswer !== null ? (isCorrect ? "✓" : isSelected ? "✗" : num) : num}
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
