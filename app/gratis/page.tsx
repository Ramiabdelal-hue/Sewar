"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestionCard from "@/components/QuestionCard";
import WatermarkedImage from "@/components/WatermarkedImage";
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
      <p className="text-gray-500 text-sm">{lang === "ar" ? "لا يوجد شروح مجانية بعد" : lang === "nl" ? "Nog geen gratis lessen" : lang === "fr" ? "Pas encore de leçons gratuites" : "No free lessons yet"}</p>
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
          ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : lang === "fr" ? "Précédent" : "Previous"}
        </button>
        <button onClick={() => router.push("/theorie")} className="px-4 py-2 rounded-xl font-black text-xs" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
          🔓 {lang === "ar" ? "اشترك للمزيد" : lang === "nl" ? "Meer? Inschrijven" : lang === "fr" ? "Plus? S'inscrire" : "More? Subscribe"}
        </button>
        <button onClick={() => { setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1)); window.scrollTo(0, 0); }}
          disabled={currentIndex + 1 >= questions.length}
          className={`px-6 py-3 font-black text-sm border-2 transition-all ${currentIndex + 1 >= questions.length ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-white border-[#003399] bg-[#003399] hover:bg-[#0055cc]"}`}>
          {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : lang === "fr" ? "Suivant" : "Next"} →
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
  const [hasReadCurrentQuestion, setHasReadCurrentQuestion] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRef = useRef<NodeJS.Timeout | null>(null);
  const stopTtsRef = useRef(false);
  const ttsSessionRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isRtl = lang === "ar";

  // خلط الأسئلة عند أول تحميل أو عند تغيير الأسئلة
  useEffect(() => {
    if (questions.length > 0) {
      setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    }
  }, [questions]);

  // فتح قناة الصوت عند أول تفاعل (مطلوب على iOS/Android)
  const unlockAudio = () => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    u.rate = 1;
    window.speechSynthesis.speak(u);
    // افتح AudioContext مسبقاً لضمان عمل التصفيق
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    } catch {}
  };

  // دالة إيقاف فوري شاملة
  const killTts = () => {
    stopTtsRef.current = true;
    ttsSessionRef.current += 1;
    if (ttsRef.current) { clearTimeout(ttsRef.current); ttsRef.current = null; }
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    }
  };

  const q = shuffledQuestions[currentIndex];
  const textsToTranslate = q ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);
  const translatedRef = useRef<string[]>(["", "", "", ""]);
  useEffect(() => { translatedRef.current = translatedTexts; }, [translatedTexts]);

  // القارئ التلقائي
  const speakQuestion = (q: any, translated: string[]) => {
    if (!window.speechSynthesis || !q) {
      setReadingDone(true);
      return;
    }

    stopTtsRef.current = false;
    const session = ttsSessionRef.current;
    window.speechSynthesis.cancel();
    setReadingDone(false);

    const langMap: Record<string, string> = { nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" };
    const speechLang = langMap[lang] || "nl-NL";

    const getVoice = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      const femaleVoice = voices.find(v =>
        v.lang === speechLang &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('zira') ||
         v.name.toLowerCase().includes('hazel') ||
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('tessa') ||
         v.name.toLowerCase().includes('moira') ||
         v.name.toLowerCase().includes('fiona') ||
         v.name.toLowerCase().includes('amelie') ||
         v.name.toLowerCase().includes('thomas') === false)
      );
      if (femaleVoice) return femaleVoice;
      return voices.find(v => v.lang === speechLang)
        || voices.find(v => v.lang.startsWith(speechLang.split("-")[0]))
        || voices.find(v => v.lang === "nl-NL")
        || null;
    };

    const isValid = () => ttsSessionRef.current === session && !stopTtsRef.current;

    const speak = (text: string, onEnd?: () => void) => {
      if (!isValid()) { setReadingDone(true); return; }
      if (!text) { if (onEnd) onEnd(); else setReadingDone(true); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      u.rate = 0.3;
      u.pitch = 1;
      const v = getVoice();
      if (v) u.voice = v;
      if (onEnd) {
        u.onend = () => { if (isValid()) onEnd(); else setReadingDone(true); };
      } else {
        u.onend = () => setReadingDone(true);
      }
      u.onerror = () => { if (isValid() && onEnd) onEnd(); else setReadingDone(true); };
      window.speechSynthesis.speak(u);
    };

    const questionText = (translated[0] && translated[0] !== (q.textNL || q.text))
      ? translated[0] : (q.textNL || q.text || "");
    const ans1 = translated[1] || q.answer1 || "";
    const ans2 = translated[2] || q.answer2 || "";
    const ans3 = translated[3] || q.answer3 || "";
    const answersList = [ans1, ans2, ans3].filter(Boolean);
    const labels = lang === "ar"
      ? ["الجواب A:", "الجواب B:", "الجواب C:"]
      : lang === "fr" ? ["Réponse A:", "Réponse B:", "Réponse C:"]
      : lang === "en" ? ["Answer A:", "Answer B:", "Answer C:"]
      : ["Antwoord A:", "Antwoord B:", "Antwoord C:"];

    if (!questionText) { setReadingDone(true); return; }

    speak(questionText, () => {
      if (!isValid()) { setReadingDone(true); return; }
      let i = 0;
      const readNext = () => {
        if (!isValid()) { setReadingDone(true); return; }
        if (i >= answersList.length) { setReadingDone(true); return; }
        speak(`${labels[i]} ${answersList[i]}`, () => {
          i++;
          if (i >= answersList.length) {
            setReadingDone(true);
          } else {
            ttsRef.current = setTimeout(() => {
              if (isValid()) readNext(); else setReadingDone(true);
            }, 400);
          }
        });
      };
      if (answersList.length === 0) {
        setReadingDone(true);
      } else {
        ttsRef.current = setTimeout(() => {
          if (isValid()) readNext(); else setReadingDone(true);
        }, 600);
      }
    });
  };

  // تشغيل القراءة بعد ثانية - نفس السلوك على كل الأجهزة
  useEffect(() => {
    if (!started || finished) return;
    killTts();
    setReadingDone(false);
    setHasReadCurrentQuestion(false);

    // بدء القراءة بعد ثانية واحدة على كل الأجهزة
    ttsRef.current = setTimeout(() => {
      stopTtsRef.current = false;
      const q = shuffledQuestions[currentIndex];
      if (!q) { setReadingDone(true); return; }

      setHasReadCurrentQuestion(true);

      const texts = lang === "nl"
        ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""]
        : translatedRef.current;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakQuestion(q, texts);
      } else {
        let voiceStarted = false;
        const startOnce = () => {
          if (voiceStarted || stopTtsRef.current) return;
          voiceStarted = true;
          window.speechSynthesis.onvoiceschanged = null;
          speakQuestion(q, texts);
        };
        window.speechSynthesis.onvoiceschanged = startOnce;
        setTimeout(startOnce, 1000);
      }
    }, 1000);

    return () => { killTts(); };
  }, [currentIndex, started, finished]);

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

  const [showRoses, setShowRoses] = useState(false);
  const [showWrong, setShowWrong] = useState(false);

  // صوت "Bravo!" عند الإجابة الصحيحة
  const playApplause = () => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const bravoTexts: Record<string, string[]> = {
        nl: ["Bravo!", "Uitstekend!", "Geweldig!", "Perfect!"],
        fr: ["Bravo!", "Excellent!", "Parfait!", "Très bien!"],
        ar: ["برافو!", "ممتاز!", "أحسنت!", "رائع!"],
        en: ["Bravo!", "Excellent!", "Well done!", "Perfect!"],
      };
      const options = bravoTexts[lang] || bravoTexts.nl;
      const text = options[Math.floor(Math.random() * options.length)];

      const u = new SpeechSynthesisUtterance(text);
      u.lang = { nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" }[lang] || "nl-NL";
      u.rate = 1.1;
      u.pitch = 1.4;
      u.volume = 1;

      // صوت أنثى إن أمكن
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.lang.startsWith(u.lang.split('-')[0]) &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('zira') ||
         v.name.toLowerCase().includes('hazel'))
      );
      if (femaleVoice) u.voice = femaleVoice;

      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error('Bravo error:', e);
    }
  };

  const launchRoses = () => {
    setShowRoses(true);
    setTimeout(() => setShowRoses(false), 2500);
  };

  const launchWrong = () => {
    setShowWrong(true);
    setTimeout(() => setShowWrong(false), 800);
  };

  const handleAnswer = (num: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    killTts();
    clearInterval(timerRef.current!);
    if (shuffledQuestions[currentIndex]?.correctAnswer === num) {
      launchRoses();
    } else {
      launchWrong();
    }
    setAnswers(a => ({ ...a, [currentIndex]: num }));
    setLocked(true);
  };

  const handleNext = () => {
    killTts();
    setReadingDone(false);
    if (currentIndex + 1 >= shuffledQuestions.length) setFinished(true);
    else { setCurrentIndex(i => i + 1); setLocked(false); }
  };

  // حساب النتيجة مع مراعاة الـ 5 نقاط
  const score = Object.entries(answers).reduce((total, [i, ans]) => {
    if (ans === null || ans === undefined) return total;
    const q = shuffledQuestions[parseInt(i)];
    if (!q) return total;
    const pts = q.points || 1;
    return total + (q.correctAnswer === ans ? pts : 0);
  }, 0);
  const maxScore = shuffledQuestions.reduce((t, q) => t + (q.points || 1), 0);
  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  if (shuffledQuestions.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎯</div>
      <p className="text-gray-500 text-sm">{lang === "ar" ? "لا يوجد أسئلة مجانية بعد" : lang === "nl" ? "Nog geen gratis examenvragen" : lang === "fr" ? "Pas encore de questions gratuites" : "No free exam questions yet"}</p>
    </div>
  );

  if (!started) return (
    <div className="text-center py-10">
      <div className="border-4 border-[#003399] rounded-2xl p-8 max-w-md mx-auto">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-black text-[#003399] mb-2">Gratis Examen</h2>
        <p className="text-gray-500 mb-2">{shuffledQuestions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : lang === "fr" ? "questions" : "questions"}</p>
        <p className="text-sm text-orange-600 font-bold mb-6">⏱ {lang === "ar" ? "15 ثانية لكل سؤال" : lang === "nl" ? "15 seconden per vraag" : lang === "fr" ? "15 secondes par question" : "15 seconds per question"}</p>
        <button onClick={() => { unlockAudio(); setStarted(true); }} className="px-8 py-3 font-black text-white rounded-xl" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
          {lang === "ar" ? "ابدأ" : lang === "nl" ? "Start" : lang === "fr" ? "Démarrer" : "Start"} →
        </button>
      </div>
    </div>
  );

  if (finished) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = pct >= 60;
    return (
      <div className="py-6">
        <div className={`rounded-2xl p-6 mb-4 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
          <div className="text-5xl mb-2">{passed ? "🏆" : "😔"}</div>
          <h2 className="text-xl font-black mb-1" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
            {passed
              ? (lang === "ar" ? "🎉 مبروك! نجحت" : lang === "nl" ? "🎉 Geslaagd!" : lang === "fr" ? "🎉 Réussi!" : "🎉 Passed!")
              : (lang === "ar" ? "❌ حاول مجدداً" : lang === "nl" ? "❌ Helaas niet geslaagd" : lang === "fr" ? "❌ Malheureusement échoué" : "❌ Not passed")}
          </h2>
          <div className="flex justify-center gap-4 mt-3">
            <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === "ar" ? "النقاط" : lang === "nl" ? "Behaald" : lang === "fr" ? "Points" : "Points"}</p>
              <p className="text-3xl font-black text-green-600">{score}</p>
            </div>
            <div className="flex items-center text-3xl font-black text-gray-300">/</div>
            <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === "ar" ? "المجموع" : lang === "nl" ? "Totaal" : lang === "fr" ? "Total" : "Total"}</p>
              <p className="text-3xl font-black text-indigo-600">{maxScore}</p>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Score</p>
              <p className="text-3xl font-black" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</p>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold border border-green-200">
              ✓ {lang === "ar" ? "صح" : lang === "nl" ? "Correct" : lang === "fr" ? "Correct" : "Correct"}: {shuffledQuestions.filter((q,i) => answers[i] === q.correctAnswer).length}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
              ✗ {lang === "ar" ? "خطأ" : lang === "nl" ? "Fout" : lang === "fr" ? "Faux" : "Wrong"}: {shuffledQuestions.filter((q,i) => answers[i] !== undefined && answers[i] !== null && answers[i] !== q.correctAnswer).length}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { unlockAudio(); setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); setShuffledQuestions([...questions].sort(() => Math.random() - 0.5)); }}
            className="flex-1 py-3 font-black text-white rounded-xl" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
            🔄 {lang === "ar" ? "إعادة" : lang === "nl" ? "Opnieuw" : lang === "fr" ? "Recommencer" : "Retry"}
          </button>
          <button onClick={() => router.push("/theorie")} className="flex-1 py-3 font-black rounded-xl" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399" }}>
            🔓 {lang === "ar" ? "اشترك للمزيد" : lang === "nl" ? "Meer? Inschrijven" : lang === "fr" ? "Plus? S'inscrire" : "More? Subscribe"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* تأثير الورود عند الإجابة الصحيحة */}
      {showRoses && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-60px',
                fontSize: `${1.5 + Math.random() * 1.5}rem`,
                animation: `roseFall ${1.2 + Math.random() * 1.2}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.6}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {['🌹','🌸','🌺','💐','🌷'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
          <style>{`
            @keyframes roseFall {
              0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
              80%  { opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* تأثير الإجابة الخاطئة - اهتزاز أحمر */}
      {showWrong && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl animate-bounce" style={{ animationDuration: '0.3s', animationIterationCount: '3' }}>
              ❌
            </div>
          </div>
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }
          `}</style>
        </div>
      )}

      {/* شريط التقدم */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-500">{currentIndex + 1} / {shuffledQuestions.length}</span>
        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
          <div className="bg-[#003399] h-2 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}></div>
        </div>
        <span className="text-sm font-bold text-gray-500">Score: {score}</span>
      </div>

      {q && (
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          {/* رأس السؤال */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm">{currentIndex + 1} / {shuffledQuestions.length}</span>
              {q.points === 5 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
                  style={{ background: "rgba(239,68,68,0.85)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                  ⭐ 5 {lang === "ar" ? "نقاط" : lang === "nl" ? "punten" : "pts"}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
              locked ? "bg-white/20 border-white/40 text-white" :
              !readingDone ? "bg-blue-500 border-blue-300 text-white animate-pulse" :
              timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse" :
              timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white" :
              "bg-green-500 border-green-300 text-white"
            }`}>
              <span>{!readingDone && !locked ? "🎧" : "⏱"}</span>
              <span>{locked ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "✅" : "❌") : "⏱") : !readingDone ? (lang === "ar" ? "قراءة..." : lang === "nl" ? "Lezen..." : lang === "fr" ? "Lecture..." : "Reading...") : timeLeft}</span>
              {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
            </div>
          </div>

          {/* صورة */}
          {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
            <div className={`grid gap-1 bg-gray-900 p-2 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <WatermarkedImage src={url} className="w-full h-auto" />
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 bg-white">
            <p className={`text-lg font-bold text-gray-900 leading-relaxed mb-3 ${isRtl ? "text-right" : "text-left"}`}>
              {translatedTexts[0] || q.textNL || q.text}
            </p>

            {/* مؤشر حالة القراءة والمؤقت */}
            {!locked && (
              <div className={`text-center mb-4 p-2 rounded-lg text-sm font-bold ${
                !readingDone 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {!readingDone 
                  ? (lang === "ar" ? "🎧 جاري قراءة السؤال والإجابات A, B, C..." : 
                     lang === "nl" ? "🎧 Vraag en antwoorden A, B, C worden voorgelezen..." : 
                     lang === "fr" ? "🎧 Lecture de la question et réponses A, B, C..." : 
                     "🎧 Reading question and answers A, B, C...")
                  : (lang === "ar" ? `⏱ انتهت القراءة - لديك ${timeLeft} ثانية للإجابة` : 
                     lang === "nl" ? `⏱ Voorlezen klaar - Je hebt ${timeLeft} seconden om te antwoorden` : 
                     lang === "fr" ? `⏱ Lecture terminée - Vous avez ${timeLeft} secondes pour répondre` : 
                     `⏱ Reading finished - You have ${timeLeft} seconds to answer`)
                }
              </div>
            )}
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
                {currentIndex + 1 >= shuffledQuestions.length ? (lang === "ar" ? "النتيجة 🏆" : lang === "nl" ? "Resultaat 🏆" : lang === "fr" ? "Résultat 🏆" : "Result 🏆") : (lang === "ar" ? "التالي ←" : lang === "nl" ? "Volgende →" : lang === "fr" ? "Suivant →" : "Next →")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
function GratisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const isRtl = lang === "ar";

  const initialCat = searchParams.get("cat")?.toUpperCase();
  const validCats = ["A", "B", "C"];
  const [category, setCategory] = useState(validCats.includes(initialCat || "") ? initialCat! : "B");
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
      .then(d => { if (d.success) { setQuestions(d.questions || []); setExamQuestions((d.examQuestions || []).sort(() => Math.random() - 0.5)); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Gratis Lessen</h1>
              <p className="text-white/50 text-xs">{lang === "ar" ? "محتوى مجاني بدون اشتراك" : lang === "nl" ? "Gratis inhoud zonder abonnement" : lang === "fr" ? "Contenu gratuit sans abonnement" : "Free content without subscription"}</p>
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
              📚 {lang === "ar" ? "شروح" : lang === "nl" ? "Lessen" : lang === "fr" ? "Leçons" : "Lessons"}
              {questions.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-black" style={{ background: "rgba(34,197,94,0.3)", color: "#86efac" }}>
                  🎁 {questions.length}
                </span>
              )}
            </button>
            <button onClick={() => setTab("exam")} className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={tab === "exam" ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              🎯 {lang === "ar" ? "امتحانات" : lang === "nl" ? "Examens" : lang === "fr" ? "Examens" : "Exams"} ({examQuestions.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>
        ) : tab === "lessons" ? (
          <LessonsTab questions={questions} lang={lang} router={router} />
        ) : (
          <ExamTab questions={examQuestions} lang={lang} router={router} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function GratisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>}>
      <GratisContent />
    </Suspense>
  );
}  );
}
