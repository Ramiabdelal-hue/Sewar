"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";



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
  const stopTtsRef = useRef(false);
  const ttsSessionRef = useRef(0);
  const [readingDone, setReadingDone] = useState(false);
  const [hasReadCurrentQuestion, setHasReadCurrentQuestion] = useState(false);
  const [showRoses, setShowRoses] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  // قراءة تلقائية للسؤال والإجابات - نفس السلوك على كل الأجهزة
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
      
      // البحث عن صوت أنثى أولاً
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
      
      // إذا لم نجد صوت أنثى محدد، نبحث عن أي صوت باللغة المطلوبة
      return voices.find(v => v.lang === speechLang)
        || voices.find(v => v.lang.startsWith(speechLang.split("-")[0]))
        || voices.find(v => v.lang === "nl-NL")
        || null;
    };

    // تحقق من صلاحية الـ session قبل أي عمل
    const isValid = () => ttsSessionRef.current === session && !stopTtsRef.current;

    const speak = (text: string, onEnd?: () => void) => {
      if (!isValid()) {
        setReadingDone(true);
        return;
      }
      if (!text) { 
        if (onEnd) onEnd(); 
        else setReadingDone(true);
        return; 
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      u.rate = 0.3; // سرعة أبطأ للوضوح
      u.pitch = 1;
      const v = getVoice();
      if (v) u.voice = v;
      if (onEnd) {
        u.onend = () => { 
          if (isValid()) onEnd(); 
          else setReadingDone(true);
        };
      } else {
        u.onend = () => setReadingDone(true);
      }
      u.onerror = () => { 
        if (isValid() && onEnd) onEnd(); 
        else setReadingDone(true);
      };
      window.speechSynthesis.speak(u);
    };

    const questionText = translated[0] || q.textNL || q.text || "";
    const answersList = [
      translated[1] || q.answer1,
      translated[2] || q.answer2,
      translated[3] || q.answer3,
    ].filter(Boolean);

    const labels = lang === "ar"
      ? ["الجواب A:", "الجواب B:", "الجواب C:"]
      : lang === "fr"
      ? ["Réponse A:", "Réponse B:", "Réponse C:"]
      : lang === "en"
      ? ["Answer A:", "Answer B:", "Answer C:"]
      : ["Antwoord A:", "Antwoord B:", "Antwoord C:"];

    if (!questionText) { 
      setReadingDone(true); 
      return; 
    }

    speak(questionText, () => {
      if (!isValid()) {
        setReadingDone(true);
        return;
      }
      
      let i = 0;
      const readNext = () => {
        if (!isValid()) {
          setReadingDone(true);
          return;
        }
        if (i >= answersList.length) { 
          setReadingDone(true); 
          return; 
        }
        speak(`${labels[i]} ${answersList[i]}`, () => {
          i++;
          if (i >= answersList.length) {
            setReadingDone(true);
          } else {
            ttsRef.current = setTimeout(() => { 
              if (isValid()) readNext(); 
              else setReadingDone(true);
            }, 400);
          }
        });
      };
      
      if (answersList.length === 0) {
        setReadingDone(true);
      } else {
        ttsRef.current = setTimeout(() => { 
          if (isValid()) readNext(); 
          else setReadingDone(true);
        }, 600);
      }
    });
  };

  // تشغيل القراءة بعد ثانية من كل سؤال جديد - نفس السلوك على كل الأجهزة
  useEffect(() => {
    if (!started || finished) return;
    killTts();
    setReadingDone(false);
    setHasReadCurrentQuestion(false);

    // بدء القراءة بعد ثانية واحدة على كل الأجهزة
    ttsRef.current = setTimeout(() => {
      stopTtsRef.current = false;
      const q = questions[currentIndex];
      if (!q) { setReadingDone(true); return; }

      setHasReadCurrentQuestion(true);

      const texts = lang === "nl"
        ? [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""]
        : (() => {
            const t = translatedRef.current;
            const hasTranslation = t[0] && t[0] !== (q.textNL || q.text || "");
            return hasTranslation ? t : [q.textNL || q.text || "", q.answer1 || "", q.answer2 || "", q.answer3 || ""];
          })();

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

  // فتح قناة الصوت عند أول تفاعل (مطلوب على iOS/Android)
  const unlockAudio = () => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    u.rate = 1;
    window.speechSynthesis.speak(u);
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    } catch {}
  };

  // صوت تصفيق احترافي + ورود عند الإجابة الصحيحة
  const playApplause = () => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const sampleRate = ctx.sampleRate;

      const makeClap = (startTime: number, intensity: number) => {
        const clapDuration = 0.12;
        const bufSize = Math.floor(sampleRate * clapDuration);
        const buf = ctx.createBuffer(2, bufSize, sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = buf.getChannelData(ch);
          for (let i = 0; i < bufSize; i++) {
            const t = i / sampleRate;
            const env = Math.exp(-t * 35) * (1 - Math.exp(-t * 800));
            const noise = (Math.random() * 2 - 1);
            const snap = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 80);
            d[i] = (noise * 0.7 + snap * 0.3) * env * intensity;
          }
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(intensity, ctx.currentTime + startTime);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(ctx.currentTime + startTime);
      };

      const clapPattern = [
        0.00, 0.05, 0.08, 0.12, 0.16,
        0.35, 0.38, 0.42, 0.46, 0.50,
        0.65, 0.68, 0.70, 0.73, 0.76, 0.79,
        1.00, 1.03, 1.07, 1.12, 1.18,
        1.40, 1.45, 1.52, 1.60,
        1.80, 1.90, 2.05, 2.20,
      ];
      clapPattern.forEach((t) => {
        const intensity = 0.5 + Math.random() * 0.5;
        const jitter = (Math.random() - 0.5) * 0.015;
        makeClap(t + jitter, intensity);
      });

      const cheerDuration = 2.0;
      const cheerBuf = ctx.createBuffer(1, Math.floor(sampleRate * cheerDuration), sampleRate);
      const cheerData = cheerBuf.getChannelData(0);
      for (let i = 0; i < cheerData.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / cheerDuration) * Math.PI) * 0.15;
        cheerData[i] = (Math.random() * 2 - 1) * env;
      }
      const cheerSrc = ctx.createBufferSource();
      cheerSrc.buffer = cheerBuf;
      const cheerFilter = ctx.createBiquadFilter();
      cheerFilter.type = 'lowpass';
      cheerFilter.frequency.value = 400;
      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0.3, ctx.currentTime);
      cheerSrc.connect(cheerFilter);
      cheerFilter.connect(cheerGain);
      cheerGain.connect(ctx.destination);
      cheerSrc.start(ctx.currentTime + 0.1);

    } catch (e) { console.error('Applause error:', e); }
  };

  const launchRoses = () => {
    setShowRoses(true);
    setTimeout(() => setShowRoses(false), 2500);
  };

  const handleAnswer = (num: number) => {
    if (locked || answers[currentIndex] !== undefined) return;
    killTts();
    clearInterval(timerRef.current!);
    if (questions[currentIndex]?.correctAnswer === num) {
      playApplause();
      launchRoses();
    }
    setAnswers(a => ({ ...a, [currentIndex]: num }));
    setLocked(true);
  };

  const handleNext = () => {
    killTts();
    setReadingDone(false);
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setLocked(false);
    }
  };

  const score = Object.entries(answers).reduce((total, [i, ans]) => {
    if (ans === null || ans === undefined) return total;
    const question = questions[parseInt(i)];
    if (!question) return total;
    const pts = question.points || 1;
    return total + (question.correctAnswer === ans ? pts : 0);
  }, 0);
  const maxScore = questions.reduce((t, q) => t + (q.points || 1), 0);

  const q = questions[currentIndex];
  const isRtl = lang === "ar";

  const translatedRef = useRef<string[]>(["", "", "", ""]);

  // Hook يجب أن يكون دائماً قبل أي return مشروط
  const textsToTranslate = q ? [
    q.textNL || q.text || "",
    q.answer1 || "",
    q.answer2 || "",
    q.answer3 || "",
  ] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  // حفظ آخر ترجمة في ref
  useEffect(() => {
    translatedRef.current = translatedTexts;
  }, [translatedTexts]);

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
            {lang === "ar" ? `امتحان الفئة ${cat}` : lang === "nl" ? `Examen Categorie ${cat}` : lang === "fr" ? `Examen Catégorie ${cat}` : `Exam Category ${cat}`}
          </h1>
          <p className="text-gray-500 mb-2">{questions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : lang === "fr" ? "questions" : "questions"}</p>
          <p className="text-sm text-orange-600 font-bold mb-8">
            ⏱ {lang === "ar" ? "15 ثانية لكل سؤال" : lang === "nl" ? "15 seconden per vraag" : lang === "fr" ? "15 secondes par question" : "15 seconds per question"}
          </p>
          {questions.length === 0 ? (
            <p className="text-red-500 font-bold">{lang === "ar" ? "لا توجد أسئلة بعد" : lang === "nl" ? "Geen vragen beschikbaar" : lang === "fr" ? "Pas encore de questions" : "No questions yet"}</p>
          ) : (
            <button onClick={() => { unlockAudio(); setStarted(true); }}
              className="px-10 py-4 font-black text-white text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              {lang === "ar" ? "ابدأ الامتحان" : lang === "nl" ? "Start Examen" : lang === "fr" ? "Démarrer l'examen" : "Start Exam"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // صفحة النتيجة
  if (finished) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = pct >= 60;
    const wrongAnswers = questions.filter((q, i) => answers[i] !== q.correctAnswer);
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

    return (
      <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* بطاقة النتيجة */}
          <div className={`rounded-2xl p-8 mb-6 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
            <div className="text-6xl mb-3">{passed ? "🏆" : "😔"}</div>
            <h1 className="text-2xl font-black mb-1" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {passed
                ? (lang === "ar" ? "مبروك! نجحت" : lang === "nl" ? "Gefeliciteerd! Geslaagd!" : lang === "fr" ? "Félicitations! Réussi!" : "Congratulations! Passed!")
                : (lang === "ar" ? "لم تنجح هذه المرة" : lang === "nl" ? "Helaas niet geslaagd" : lang === "fr" ? "Malheureusement pas réussi" : "Unfortunately not passed")}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "النقاط" : lang === "nl" ? "Behaald" : lang === "fr" ? "Points" : "Points"}
                </p>
                <p className="text-3xl font-black text-green-600">{score}</p>
                <p className="text-xs text-gray-400">/ {maxScore}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "صح" : lang === "nl" ? "Correct" : lang === "fr" ? "Correct" : "Correct"}
                </p>
                <p className="text-3xl font-black text-blue-600">{correctCount}</p>
                <p className="text-xs text-gray-400">/ {questions.length}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "خطأ" : lang === "nl" ? "Fout" : lang === "fr" ? "Faux" : "Wrong"}
                </p>
                <p className="text-3xl font-black text-red-500">{questions.length - correctCount}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Score</p>
                <p className="text-3xl font-black" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</p>
              </div>
            </div>
          </div>

          {/* مراجعة الأسئلة الخاطئة */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm">✗</span>
                {lang === "ar" ? `الأسئلة الخاطئة (${wrongAnswers.length})` : lang === "nl" ? `Foute antwoorden (${wrongAnswers.length})` : lang === "fr" ? `Mauvaises réponses (${wrongAnswers.length})` : `Wrong answers (${wrongAnswers.length})`}
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
                        {q.points === 5 && (
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#dc2626" }}>⭐ 5 {lang === "ar" ? "نقاط" : lang === "nl" ? "punten" : "pts"}</span>)}
                        {timedOut && (
                          <span className="text-xs font-black text-orange-500 flex items-center gap-1">
                            ⏱ {lang === "ar" ? "انتهى الوقت" : lang === "nl" ? "Tijd verlopen" : lang === "fr" ? "Temps écoulé" : "Time out"}
                          </span>
                        )}
                      </div>

                      {/* صورة */}
                      {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
                        <div className={`grid gap-0.5 bg-gray-900 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {q.videoUrls.filter(Boolean).map((url: string, idx: number) => (
                            <div key={idx} className="relative rounded overflow-hidden">
                              <img src={url} alt="" className="w-full h-auto" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                <img src="/logo.png" alt="" style={{ width: '45%', height: '45%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }} />
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
                                {isCorrectAns && (
                                  <span className="text-xs font-black text-green-600">
                                    {lang === "ar" ? "الصحيحة" : lang === "nl" ? "Correct" : lang === "fr" ? "Correct" : "Correct"}
                                  </span>
                                )}
                                {isUserAns && !isCorrectAns && (
                                  <span className="text-xs font-black text-red-500">
                                    {lang === "ar" ? "إجابتك" : lang === "nl" ? "Jouw antwoord" : lang === "fr" ? "Votre réponse" : "Your answer"}
                                  </span>
                                )}
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
          {correctCount > 0 && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-black text-gray-500 flex items-center gap-2 mb-3 select-none">
                <span className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm">✓</span>
                {lang === "ar" ? `الأسئلة الصحيحة (${correctCount})` : lang === "nl" ? `Goede antwoorden (${correctCount})` : lang === "fr" ? `Bonnes réponses (${correctCount})` : `Correct answers (${correctCount})`}
              </summary>
              <div className="space-y-2 mt-2">
                {questions.map((q, i) => {
                  if (answers[i] !== q.correctAnswer) return null;
                  return (
                    <div key={i} className="bg-white rounded-xl px-4 py-3 border border-green-200 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-gray-700 flex-1 truncate">{q.textNL || q.text}</p>
                      {q.points === 5 && (
                        <span className="text-xs font-black text-red-500">⭐ 5</span>
                      )}
                      <span className="text-green-500 font-black text-sm">✓</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* أزرار */}
          <div className="flex gap-3">
            <button onClick={() => { unlockAudio(); setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); setQuestions(q => [...q].sort(() => Math.random() - 0.5)); }}
              className="flex-1 py-3 font-black text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              🔄 {lang === "ar" ? "إعادة" : lang === "nl" ? "Opnieuw" : lang === "fr" ? "Recommencer" : "Retry"}
            </button>
            <button onClick={() => router.back()}
              className="flex-1 py-3 font-black border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95">
              ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
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
      
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* السؤال */}
        {q && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* رأس السؤال - العد + المؤقت */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">
                  {currentIndex + 1} / {questions.length}
                </span>
                {/* شارة 5 نقاط */}
                {q.points === 5 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ background: "rgba(239,68,68,0.85)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                    ⭐ 5 {lang === "ar" ? "نقاط" : lang === "nl" ? "punten" : lang === "fr" ? "pts" : "pts"}
                  </span>
                )}
              </div>

              {/* المؤقت بجانب رقم السؤال */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
                locked ? "bg-white/20 border-white/40 text-white" :
                !readingDone ? "bg-blue-500 border-blue-300 text-white animate-pulse" :
                timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse" :
                timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white" :
                "bg-green-500 border-green-300 text-white"
              }`}>
                <span>{!readingDone && !locked ? "🎧" : "⏱"}</span>
                <span className="text-lg">
                  {locked
                    ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "✅" : "❌") : "⏱")
                    : !readingDone ? (lang === "ar" ? "قراءة..." : lang === "nl" ? "Lezen..." : lang === "fr" ? "Lecture..." : "Reading...") : timeLeft}
                </span>
                {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
              </div>
            </div>

            {/* الصور */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div className={`grid gap-1 bg-gray-900 p-2 ${q.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-auto" draggable={false} onContextMenu={e => e.preventDefault()} />
                    {/* watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <img src="/logo.png" alt="" style={{ width: '45%', height: '45%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }} draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* نص السؤال */}
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

              {/* الإجابات */}
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
                      else if (isSelected && !isCorrect) style = "bg-red-50 border-2 border-red-500 text-red-800";
                      else style = "bg-gray-50 border-2 border-gray-200 text-gray-500";
                    } else {
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
                          : locked ? "bg-gray-200 text-gray-400"
                          : "bg-[#003399] text-white"
                      }`}>
                        {isAnswered && userAnswer !== null ? (isCorrect ? "✓" : isSelected ? "✗" : label) : label}
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
                    ? (lang === "ar" ? "عرض النتيجة 🏆" : lang === "nl" ? "Resultaat bekijken 🏆" : lang === "fr" ? "Voir le résultat 🏆" : "View Result 🏆")
                    : (lang === "ar" ? "التالي ←" : lang === "nl" ? "Volgende →" : lang === "fr" ? "Suivant →" : "Next →")}
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

export default function ExamenCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ExamenCategoryContent />
    </Suspense>
  );
}
