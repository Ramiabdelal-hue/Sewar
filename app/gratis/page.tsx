"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useLang } from "@/context/LangContext";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

// ─── تبويب الشروح ────────────────────────────────────────────────────────────
function LessonsTab({ questions, lang, router }: { questions: any[], lang: string, router: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRtl = lang === "ar";

  if (questions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📚</div>
      <p className="text-gray-500 text-sm">{lang === "ar" ? "لا يوجد شروح مجانية بعد" : "Nog geen gratis lessen"}</p>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500">{currentIndex + 1} / {questions.length}</span>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
          <div className="bg-[#003399] h-2 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>🎁 Gratis</span>
      </div>
      {questions[currentIndex]?.lesson && (
        <div className="mb-3 px-4 py-2 rounded-xl text-xs font-bold text-[#003399]" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          📚 {questions[currentIndex].lesson.title}
        </div>
      )}
      <QuestionCard question={questions[currentIndex]} index={currentIndex} total={questions.length} lang={lang} onNext={() => {}} onPrev={() => {}} />
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); window.scrollTo(0, 0); }}
          disabled={currentIndex === 0}
          className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex === 0 ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"}`}>
          ← {lang === "ar" ? "السابق" : "Vorige"}
        </button>
        <button onClick={() => router.push("/theorie")} className="px-4 py-2 rounded-xl font-black text-xs" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
          🔓 {lang === "ar" ? "اشترك للمزيد" : "Meer? Inschrijven"}
        </button>
        <button onClick={() => { setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1)); window.scrollTo(0, 0); }}
          disabled={currentIndex + 1 >= questions.length}
          className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex + 1 >= questions.length ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-white border-[#003399] bg-[#003399] hover:bg-[#0055cc]"}`}>
          {lang === "ar" ? "التالي" : "Volgende"} →
        </button>
      </div>
    </>
  );
}

// ─── تبويب الامتحان المجاني ───────────────────────────────────────────────────
function ExamTab({ questions, lang, router }: { questions: any[], lang: string, router: any }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [locked, setLocked] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRef = useRef<NodeJS.Timeout | null>(null);
  const isRtl = lang === "ar";

  const q = questions[currentIndex];
  const textsToTranslate = q ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);
  const translatedRef = useRef<string[]>(["", "", "", ""]);
  useEffect(() => { translatedRef.current = translatedTexts; }, [translatedTexts]);

  // القارئ التلقائي
  const speakQuestion = (q: any, translated: string[]) => {
    if (!window.speechSynthesis || !q) return;
    window.speechSynthesis.cancel();
    setReadingDone(false);
    const langMap: Record<string, string> = { nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" };
    const speechLang = langMap[lang] || "nl-NL";
    const getVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return voices.find(v => v.lang === speechLang) || voices.find(v => v.lang.startsWith(lang)) || voices.find(v => v.lang === "nl-NL") || null;
    };
    const speak = (text: string, onEnd?: () => void) => {
      if (!text) { if (onEnd) onEnd(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang; u.rate = 0.75; u.pitch = 1;
      const v = getVoice(); if (v) u.voice = v;
      if (onEnd) u.onend = onEnd;
      u.onerror = () => { if (onEnd) onEnd(); };
      window.speechSynthesis.speak(u);
    };
    const questionText = translated[0] || q.textNL || q.text || "";
    const answersList = [translated[1] || q.answer1, translated[2] || q.answer2, translated[3] || q.answer3].filter(Boolean);
    const labels = lang === "ar" ? ["الجواب A:", "الجواب B:", "الجواب C:"] : lang === "fr" ? ["Réponse A:", "Réponse B:", "Réponse C:"] : ["Antwoord A:", "Antwoord B:", "Antwoord C:"];
    if (!questionText) { setReadingDone(true); return; }
    speak(questionText, () => {
      let i = 0;
      const readNext = () => {
        if (i >= answersList.length) { setReadingDone(true); return; }
        speak(`${labels[i]} ${answersList[i]}`, () => { i++; ttsRef.current = setTimeout(readNext, 400); });
      };
      ttsRef.current = setTimeout(readNext, 600);
    });
  };

  // تشغيل القراءة بعد 3 ثوانٍ
  useEffect(() => {
    if (!started || finished) return;
    if (ttsRef.current) clearTimeout(ttsRef.current);
    window.speechSynthesis?.cancel();
    setReadingDone(false);
    ttsRef.current = setTimeout(() => {
      const q = questions[currentIndex];
      if (!q) { setReadingDone(true); return; }
      speakQuestion(q, lang === "nl" ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""] : translatedRef.current);
    }, 3000);
    return () => { if (ttsRef.current) clearTimeout(ttsRef.current); window.speechSynthesis?.cancel(); };
  }, [currentIndex, started, finished]);

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
    if (currentIndex + 1 >= questions.length) setFinished(true);
    else { setCurrentIndex(i => i + 1); setLocked(false); }
  };

  const score = Object.entries(answers).filter(([i, ans]) => ans !== null && ans !== undefined && questions[parseInt(i)]?.correctAnswer === ans).length;
  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  if (questions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎯</div>
      <p className="text-gray-500 text-sm">{lang === "ar" ? "لا يوجد أسئلة مجانية بعد" : "Nog geen gratis examenvragen"}</p>
    </div>
  );

  if (!started) return (
    <div className="text-center py-10">
      <div className="border-4 border-[#003399] rounded-2xl p-8 max-w-md mx-auto">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-black text-[#003399] mb-2">Gratis Examen</h2>
        <p className="text-gray-500 mb-2">{questions.length} {lang === "ar" ? "سؤال" : "vragen"}</p>
        <p className="text-sm text-orange-600 font-bold mb-6">⏱ {lang === "ar" ? "15 ثانية لكل سؤال" : "15 seconden per vraag"}</p>
        <button onClick={() => setStarted(true)} className="px-8 py-3 font-black text-white rounded-xl" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
          {lang === "ar" ? "ابدأ" : "Start"} →
        </button>
      </div>
    </div>
  );

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="py-6">
        <div className={`rounded-2xl p-6 mb-4 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
          <div className="text-5xl mb-2">{passed ? "🏆" : "😔"}</div>
          <h2 className="text-xl font-black mb-3" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
            {passed ? (lang === "ar" ? "مبروك!" : "Gefeliciteerd!") : (lang === "ar" ? "حاول مجدداً" : "Probeer opnieuw")}
          </h2>
          <div className="flex justify-center gap-4">
            <div className="bg-white rounded-xl px-5 py-3 shadow"><p className="text-xs text-gray-400">Correct</p><p className="text-2xl font-black text-green-600">{score}</p></div>
            <div className="bg-white rounded-xl px-5 py-3 shadow"><p className="text-xs text-gray-400">Score</p><p className="text-2xl font-black" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</p></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); }}
            className="flex-1 py-3 font-black text-white rounded-xl" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
            🔄 {lang === "ar" ? "إعادة" : "Opnieuw"}
          </button>
          <button onClick={() => router.push("/theorie")} className="flex-1 py-3 font-black rounded-xl" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
            🔓 {lang === "ar" ? "اشترك للمزيد" : "Meer? Inschrijven"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* شريط التقدم */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-500">{currentIndex + 1} / {questions.length}</span>
        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
          <div className="bg-[#003399] h-2 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
        <span className="text-sm font-bold text-gray-500">Score: {score}</span>
      </div>

      {q && (
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          {/* رأس السؤال */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
            <span className="text-white font-black text-sm">{currentIndex + 1} / {questions.length}</span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
              locked ? "bg-white/20 border-white/40 text-white" :
              !readingDone ? "bg-white/20 border-white/40 text-white" :
              timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse" :
              timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white" :
              "bg-white/20 border-white/40 text-white"
            }`}>
              <span>{!readingDone && !locked ? "🎧" : "⏱"}</span>
              <span>{locked ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "✅" : "❌") : "⏱") : !readingDone ? "..." : timeLeft}</span>
              {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
            </div>
          </div>

          {/* صورة */}
          {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
            <div className={`grid gap-1 bg-gray-900 p-2 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
                  <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src="/logo.png" alt="" style={{ width: '50%', height: '50%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }} draggable={false} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 bg-white">
            <p className={`text-lg font-bold text-gray-900 leading-relaxed mb-5 ${isRtl ? "text-right" : "text-left"}`}>
              {translatedTexts[0] || q.textNL || q.text}
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map(num => {
                const label = ["A", "B", "C"][num - 1];
                const ansText = translatedTexts[num] || q[`answer${num}`];
                if (!q[`answer${num}`]) return null;
                const isCorrect = q.correctAnswer === num;
                const isSelected = userAnswer === num;
                let style = "bg-white border-2 border-gray-300 text-gray-800 hover:border-[#003399]";
                if (isAnswered || locked) {
                  if (isAnswered && userAnswer !== null) {
                    if (isCorrect) style = "bg-green-50 border-2 border-green-500 text-green-800";
                    else if (isSelected) style = "bg-red-50 border-2 border-red-500 text-red-800";
                    else style = "bg-gray-50 border-2 border-gray-200 text-gray-500";
                  } else style = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60";
                }
                return (
                  <button key={num} onClick={() => handleAnswer(num)} disabled={isAnswered || locked}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${style} ${!isAnswered && !locked ? "cursor-pointer" : "cursor-default"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      isAnswered && userAnswer !== null ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                      : locked ? "bg-gray-200 text-gray-400" : "bg-[#003399] text-white"
                    }`}>
                      {isAnswered && userAnswer !== null ? (isCorrect ? "✓" : isSelected ? "✗" : label) : label}
                    </span>
                    <span className={isRtl ? "text-right flex-1" : "text-left flex-1"}>{ansText}</span>
                  </button>
                );
              })}
            </div>
            {(isAnswered || locked) && (
              <button onClick={handleNext} className="w-full mt-4 py-3 font-black text-white rounded-xl" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                {currentIndex + 1 >= questions.length ? (lang === "ar" ? "النتيجة 🏆" : "Resultaat 🏆") : (lang === "ar" ? "التالي ←" : "Volgende →")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function GratisPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "ar";

  const [category, setCategory] = useState("B");
  const [tab, setTab] = useState<"lessons" | "exam">("lessons");
  const [questions, setQuestions] = useState<any[]>([]);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "A", label: "Rijbewijs A", icon: <MotorcycleIcon className="w-10 h-6" />, color: "#f97316" },
    { id: "B", label: "Rijbewijs B", icon: <CarIcon className="w-10 h-6" />,        color: "#3b82f6" },
    { id: "C", label: "Rijbewijs C", icon: <TruckIcon className="w-10 h-6" />,      color: "#22c55e" },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/free-content?category=${category}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setQuestions(d.questions || []); setExamQuestions(d.examQuestions || []); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Gratis Lessen</h1>
              <p className="text-white/50 text-xs">{lang === "ar" ? "محتوى مجاني بدون اشتراك" : "Gratis inhoud zonder abonnement"}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
                style={category === cat.id ? { background: cat.color, color: "white" } : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                {cat.icon}<span className="hidden sm:inline">{cat.label}</span><span className="sm:hidden">{cat.id}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab("lessons")} className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={tab === "lessons" ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              📚 {lang === "ar" ? "شروح" : "Lessen"} ({questions.length})
            </button>
            <button onClick={() => setTab("exam")} className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={tab === "exam" ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              🎯 {lang === "ar" ? "امتحانات" : "Examens"} ({examQuestions.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>
        ) : tab === "lessons" ? (
          <LessonsTab questions={questions} lang={lang} router={router} />
        ) : (
          <ExamTab questions={examQuestions} lang={lang} router={router} />
        )}
      </div>
    </div>
  );
}
