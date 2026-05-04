"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import WatermarkedImage from "@/components/WatermarkedImage";
import Footer from "@/components/Footer";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";
import { speak as ttsSpeak, stopSpeech, whenVoicesReady } from "@/lib/tts";

function GratisExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const category = searchParams.get("category") || "B";
  const lessonId = searchParams.get("lessonId") || "";
  const lessonTitle = searchParams.get("lesson") || "";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [locked, setLocked] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRef = useRef<NodeJS.Timeout | null>(null);
  const stopTtsRef = useRef(false);
  const ttsSessionRef = useRef(0);
  const translatedRef = useRef<string[]>(["", "", "", ""]);
  const isRtl = lang === "ar";

  const iosResumeRef = useRef<NodeJS.Timeout | null>(null);

  const killTts = () => {
    stopTtsRef.current = true;
    ttsSessionRef.current += 1;
    if (ttsRef.current) { clearTimeout(ttsRef.current); ttsRef.current = null; }
    if (iosResumeRef.current) { clearInterval(iosResumeRef.current); iosResumeRef.current = null; }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    }
  };

  const unlockAudio = () => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0; u.rate = 1;
    window.speechSynthesis.speak(u);
  };

  const startIosResume = () => {
    if (iosResumeRef.current) clearInterval(iosResumeRef.current);
    iosResumeRef.current = setInterval(() => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.resume();
      } else {
        if (iosResumeRef.current) { clearInterval(iosResumeRef.current); iosResumeRef.current = null; }
      }
    }, 14000);
  };

  const speakQuestion = (q: any, translated: string[]) => {
    if (!window.speechSynthesis || !q) { setReadingDone(true); return; }
    stopTtsRef.current = false;
    const session = ttsSessionRef.current;
    window.speechSynthesis.cancel();
    setReadingDone(false);

    const speechLang = ({ nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" } as Record<string,string>)[lang] || "nl-NL";
    const voices = window.speechSynthesis.getVoices();
    const femaleKw = ["female","woman","girl","fiona","samantha","anna","sara","emma","ellen","nora","zira","lotte","lea","zeina","joanna","salli","kendra","kimberly","ivy","olivia","aria"];
    const isFemale = (v: SpeechSynthesisVoice) => femaleKw.some(k => v.name.toLowerCase().includes(k));
    const voice = voices.find(v => v.lang === speechLang && isFemale(v))
      || voices.find(v => v.lang.startsWith(speechLang.split("-")[0]) && isFemale(v))
      || voices.find(v => v.lang === speechLang)
      || voices.find(v => v.lang.startsWith(speechLang.split("-")[0]))
      || null;

    const isValid = () => ttsSessionRef.current === session && !stopTtsRef.current;

    const sayText = (text: string, onEnd?: () => void) => {
      if (!isValid()) { setReadingDone(true); return; }
      if (!text) { if (onEnd) onEnd(); else setReadingDone(true); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang; u.rate = 0.7; u.pitch = 1.1; u.volume = 1;
      if (voice) u.voice = voice;
      u.onstart = () => startIosResume();
      u.onend = () => { if (isValid()) { if (onEnd) onEnd(); else setReadingDone(true); } else setReadingDone(true); };
      u.onerror = () => { if (isValid() && onEnd) onEnd(); else setReadingDone(true); };
      window.speechSynthesis.speak(u);
    };

    const questionText = translated[0] || q.textNL || q.text || "";
    const ans = [translated[1] || q.answer1, translated[2] || q.answer2, translated[3] || q.answer3].filter(Boolean);
    const labels = lang === "ar"
      ? ["\u0627\u0644\u062c\u0648\u0627\u0628 A:", "\u0627\u0644\u062c\u0648\u0627\u0628 B:", "\u0627\u0644\u062c\u0648\u0627\u0628 C:"]
      : lang === "fr"
      ? ["R\u00e9ponse A:", "R\u00e9ponse B:", "R\u00e9ponse C:"]
      : ["Antwoord A:", "Antwoord B:", "Antwoord C:"];

    if (!questionText) { setReadingDone(true); return; }

    sayText(questionText, () => {
      if (!isValid()) { setReadingDone(true); return; }
      let i = 0;
      const readNext = () => {
        if (!isValid()) { setReadingDone(true); return; }
        if (i >= ans.length) { setReadingDone(true); return; }
        sayText(`${labels[i]} ${ans[i]}`, () => {
          i++;
          if (i >= ans.length) { setReadingDone(true); }
          else { ttsRef.current = setTimeout(() => { if (isValid()) readNext(); else setReadingDone(true); }, 300); }
        });
      };
      if (ans.length === 0) { setReadingDone(true); }
      else { ttsRef.current = setTimeout(() => { if (isValid()) readNext(); else setReadingDone(true); }, 500); }
    });
  };

  useEffect(() => {
    if (!started || finished) return;
    killTts();

    if (!voiceEnabled) {
      setReadingDone(true);
      return;
    }

    setReadingDone(false);
    ttsRef.current = setTimeout(() => {
      stopTtsRef.current = false;
      const q = questions[currentIndex];
      if (!q) { setReadingDone(true); return; }
      const texts = lang === "nl"
        ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""]
        : translatedRef.current;
      whenVoicesReady(() => { if (!stopTtsRef.current) speakQuestion(q, texts); });
    }, 800);
    return () => { killTts(); };
  }, [currentIndex, started, finished, voiceEnabled]);

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

  useEffect(() => {
    fetch(`/api/free-content?category=${category}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const filtered = d.examQuestions.filter((q: any) => q.lessonId === Number(lessonId));
          // خلط الأسئلة عشوائياً في كل مرة
          setQuestions(filtered.sort(() => Math.random() - 0.5));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, lessonId]);

  const q = questions[currentIndex];
  const textsToTranslate = q
    ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""]
    : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  useEffect(() => { translatedRef.current = translatedTexts; }, [translatedTexts]);

  const score = Object.entries(answers).reduce((total, [i, ans]) => {
    if (ans === null || ans === undefined) return total;
    const question = questions[parseInt(i)];
    if (!question) return total;
    return total + (question.correctAnswer === ans ? (question.points || 1) : 0);
  }, 0);
  const maxScore = questions.reduce((t, q) => t + (q.points || 1), 0);

  const handleAnswer = (num: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    killTts();
    clearInterval(timerRef.current!);
    if (questions[currentIndex]?.correctAnswer === num) {
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 1500);
    } else {
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 800);
    }
    setAnswers(a => ({ ...a, [currentIndex]: num }));
    setLocked(true);
  };

  const handleNext = () => {
    killTts();
    setReadingDone(false);
    if (currentIndex + 1 >= questions.length) setFinished(true);
    else { setCurrentIndex(i => i + 1); setLocked(false); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
      <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── No questions ─────────────────────────────────────────────────────────────
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
            {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );

  if (!started) return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="border-4 border-[#22c55e] rounded-2xl p-10">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-black text-[#22c55e] mb-2">
            {lessonTitle || (lang === "ar" ? "امتحان مجاني" : lang === "nl" ? "Gratis Examen" : "Free Exam")}
          </h1>
          <p className="text-gray-500 mb-2">
            {questions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}
          </p>
          <p className="text-sm text-orange-600 font-bold mb-6">
            ⏱ {lang === "ar" ? "15 ثانية لكل سؤال" : lang === "nl" ? "15 seconden per vraag" : "15 seconds per question"}
          </p>

          {/* اختيار الصوت */}
          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={() => setVoiceEnabled(true)}
              className="flex-1 max-w-[160px] flex flex-col items-center gap-2 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: voiceEnabled ? "linear-gradient(135deg,#003399,#0055cc)" : "#f1f5f9",
                color: voiceEnabled ? "white" : "#6b7280",
                border: voiceEnabled ? "2px solid #003399" : "2px solid #e2e8f0",
                boxShadow: voiceEnabled ? "0 4px 14px rgba(0,51,153,0.3)" : "none",
              }}
            >
              <span className="text-2xl">🔊</span>
              <span>{lang === "ar" ? "مع صوت" : lang === "nl" ? "Met geluid" : "With sound"}</span>
            </button>
            <button
              onClick={() => setVoiceEnabled(false)}
              className="flex-1 max-w-[160px] flex flex-col items-center gap-2 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: !voiceEnabled ? "linear-gradient(135deg,#6b7280,#4b5563)" : "#f1f5f9",
                color: !voiceEnabled ? "white" : "#6b7280",
                border: !voiceEnabled ? "2px solid #6b7280" : "2px solid #e2e8f0",
                boxShadow: !voiceEnabled ? "0 4px 14px rgba(107,114,128,0.3)" : "none",
              }}
            >
              <span className="text-2xl">🔇</span>
              <span>{lang === "ar" ? "بدون صوت" : lang === "nl" ? "Zonder geluid" : "No sound"}</span>
            </button>
          </div>

          <button
            onClick={() => { if (voiceEnabled) unlockAudio(); setStarted(true); }}
            className="px-10 py-4 font-black text-white text-lg rounded-xl hover:scale-105 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            {lang === "ar" ? "ابدأ الامتحان" : lang === "nl" ? "Start Examen" : "Start Exam"} 🚀
          </button>
        </div>
      </div>
    </div>
  );

  // ── Results screen ───────────────────────────────────────────────────────────
  if (finished) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = score >= 41;
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    return (
      <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className={`rounded-2xl p-8 mb-6 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
            <div className="text-6xl mb-3">{passed ? "🎉" : "😔"}</div>
            <h1 className="text-2xl font-black mb-1" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {passed
                ? (lang === "ar" ? "مبروك! نجحت" : lang === "nl" ? "Geslaagd!" : "Passed!")
                : (lang === "ar" ? "لم تنجح هذه المرة" : lang === "nl" ? "Helaas niet geslaagd" : "Not passed")}
            </h1>
            {/* ملاحظة علامة النجاح */}
            <div className="mt-3 mb-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: passed ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.10)", color: passed ? "#16a34a" : "#dc2626", border: `1.5px solid ${passed ? "#86efac" : "#fca5a5"}` }}>
              {passed
                ? (lang === "ar" ? "✅ حصلت على 41 نقطة أو أكثر — ناجح" : lang === "nl" ? "✅ 41 punten of meer behaald — Geslaagd" : lang === "fr" ? "✅ 41 points ou plus — Réussi" : "✅ 41 points or more — Passed")
                : (lang === "ar" ? "❌ حاول مرة أخرى — تحتاج 41 نقطة للنجاح" : lang === "nl" ? "❌ Probeer opnieuw — Je hebt 41 punten nodig" : lang === "fr" ? "❌ Réessayez — Il faut 41 points pour réussir" : "❌ Try again — You need 41 points to pass")}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              {[
                { label: lang === "ar" ? "النقاط" : "Behaald", value: score, sub: `/ ${maxScore}`, color: "text-green-600" },
                { label: lang === "ar" ? "صح" : "Correct", value: correctCount, sub: `/ ${questions.length}`, color: "text-blue-600" },
                { label: lang === "ar" ? "خطأ" : "Fout", value: questions.length - correctCount, sub: "", color: "text-red-500" },
                { label: "Score", value: `${pct}%`, sub: "", color: passed ? "text-green-600" : "text-red-600" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl px-5 py-3 shadow text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {questions.some((q, i) => answers[i] !== q.correctAnswer) && (
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm">❌</span>
                {lang === "ar" ? "الأجوبة الخاطئة" : lang === "nl" ? "Foute antwoorden" : "Wrong answers"}
              </h2>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[i];
                  if (userAns === q.correctAnswer) return null;
                  return (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow border border-red-100">
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#fef2f2" }}>
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                        {q.points === 5 && <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#dc2626" }}>⭐ 5 pts</span>}
                        {(userAns === null || userAns === undefined) && (
                          <span className="text-xs font-black text-orange-500">
                            ⏰ {lang === "ar" ? "انتهى الوقت" : "Tijd verlopen"}
                          </span>
                        )}
                      </div>
                      {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
                        <div className="flex gap-1 p-1 bg-gray-100 items-stretch">
                          {q.videoUrls.filter(Boolean).map((url: string, idx: number) => (
                            <WatermarkedImage key={idx} src={url} alt="" />
                          ))}
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-bold text-gray-800 mb-3 text-sm">{q.textNL || q.text}</p>
                        <div className="space-y-2">
                          {[1, 2, 3].map(num => {
                            const ansText = q[`answer${num}`];
                            if (!ansText) return null;
                            const isCorrectAns = q.correctAnswer === num;
                            const isUserAns = userAns === num;
                            return (
                              <div key={num} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium border-2 ${isCorrectAns ? "bg-green-50 border-green-400 text-green-800" : isUserAns ? "bg-red-50 border-red-400 text-red-800" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${isCorrectAns ? "bg-green-500 text-white" : isUserAns ? "bg-red-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                                  {isCorrectAns ? "✓" : isUserAns ? "✗" : num}
                                </span>
                                <span className="flex-1">{ansText}</span>
                                {isCorrectAns && <span className="text-xs font-black text-green-600">{lang === "ar" ? "الصحيح" : "Correct"}</span>}
                                {isUserAns && !isCorrectAns && <span className="text-xs font-black text-red-500">{lang === "ar" ? "اختيارك" : "Jouw antwoord"}</span>}
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

          <div className="flex gap-3">
            <button
              onClick={() => { unlockAudio(); setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); }}
              className="flex-1 py-3 font-black text-white rounded-xl hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              🔄 {lang === "ar" ? "إعادة" : lang === "nl" ? "Opnieuw" : "Retry"}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 font-black border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95"
            >
              ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ──────────────────────────────────────────────────────────
  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {showCorrect && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500 opacity-10" />
          <div style={{ animation: "checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.95)", boxShadow: "0 0 60px rgba(34,197,94,0.7)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
          <style>{`@keyframes checkPop { 0% { transform: scale(0) rotate(-10deg); opacity: 0; } 60% { transform: scale(1.15) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }`}</style>
        </div>
      )}

      {showWrong && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl" style={{ animation: "wrongBounce 0.3s ease-in-out 3" }}>❌</div>
          </div>
          <style>{`@keyframes wrongBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }`}</style>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {q && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">{currentIndex + 1} / {questions.length}</span>
                {q.points === 5 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{ background: "rgba(239,68,68,0.85)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                    ⭐ 5 pts
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
                locked ? "bg-white/20 border-white/40 text-white"
                : !readingDone ? "bg-blue-500 border-blue-300 text-white animate-pulse"
                : timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse"
                : timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white"
                : "bg-green-500 border-green-300 text-white"
              }`}>
                <span>{!voiceEnabled ? "⏱" : !readingDone && !locked ? "🔊" : "⏱"}</span>
                <span>
                  {locked
                    ? (isAnswered && userAnswer !== null ? (userAnswer === q.correctAnswer ? "✓" : "✗") : "⏰")
                    : !readingDone
                    ? (lang === "ar" ? "يقرأ..." : "Lezen...")
                    : timeLeft}
                </span>
                {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
              </div>
            </div>

            {/* Images */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div className="flex gap-1 p-2 bg-gray-100 items-stretch">
                {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                  <WatermarkedImage key={i} src={url} alt="" />
                ))}
              </div>
            )}

            {/* Question + Answers */}
            <div className="px-5 py-4 bg-white">
              <p className={`text-lg font-bold text-gray-900 leading-relaxed mb-4 ${isRtl ? "text-right" : "text-left"}`}>
                {translatedTexts[0] || q.textNL || q.text}
              </p>
              <div className="space-y-3">
                {[1, 2, 3].map(num => {
                  const label = ["A", "B", "C"][num - 1];
                  const ansText = translatedTexts[num] || q[`answer${num}`];
                  if (!q[`answer${num}`]) return null;
                  const isCorrect = q.correctAnswer === num;
                  const isSelected = userAnswer === num;
                  let style = "bg-white border-2 border-gray-300 text-gray-800 hover:border-[#22c55e]";
                  if (isAnswered || locked) {
                    if (isAnswered && userAnswer !== null) {
                      if (isCorrect) style = "bg-green-50 border-2 border-green-500 text-green-800";
                      else if (isSelected) style = "bg-red-50 border-2 border-red-500 text-red-800";
                      else style = "bg-gray-50 border-2 border-gray-200 text-gray-500";
                    } else {
                      style = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60";
                    }
                  }
                  return (
                    <button
                      key={num}
                      onClick={() => handleAnswer(num)}
                      disabled={isAnswered || locked}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${style} ${!isAnswered && !locked ? "cursor-pointer active:scale-95" : "cursor-default"}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isAnswered && userAnswer !== null
                          ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                          : locked ? "bg-gray-200 text-gray-400" : "bg-[#22c55e] text-white"
                      }`}>
                        {isAnswered && userAnswer !== null ? (isCorrect ? "✓" : isSelected ? "✗" : label) : label}
                      </span>
                      <span className={isRtl ? "text-right flex-1" : "text-left flex-1"}>{ansText}</span>
                    </button>
                  );
                })}
              </div>

              {(isAnswered || locked) && (
                <button
                  onClick={handleNext}
                  className="w-full mt-5 py-3 font-black text-white rounded-xl hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                >
                  {currentIndex + 1 >= questions.length
                    ? (lang === "ar" ? "عرض النتائج 🏆" : lang === "nl" ? "Resultaat 🏆" : "Result 🏆")
                    : (lang === "ar" ? "التالي ➤" : lang === "nl" ? "Volgende ➤" : "Next ➤")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function GratisExamPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GratisExamContent />
    </Suspense>
  );
}
