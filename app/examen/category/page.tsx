"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import WatermarkedImage from "@/components/WatermarkedImage";
import Footer from "@/components/Footer";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";



function ExamenCategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const cat = searchParams.get("cat") || "B";
  const email = searchParams.get("email") || "";
  const lessonId = searchParams.get("lessonId"); // ط¥ط°ط§ ظ…ظˆط¬ظˆط¯ ظٹط¬ظ„ط¨ ط¯ط±ط³ ظ…ط­ط¯ط¯ ظپظ‚ط·

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
  const [showWrong, setShowWrong] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ط¯ط§ظ„ط© ط¥ظٹظ‚ط§ظپ ظپظˆط±ظٹ ط´ط§ظ…ظ„ط©
  const killTts = () => {
    stopTtsRef.current = true;
    ttsSessionRef.current += 1;
    if (ttsRef.current) { clearTimeout(ttsRef.current); ttsRef.current = null; }
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    }
  };

  // ظ‚ط±ط§ط،ط© طھظ„ظ‚ط§ط¦ظٹط© ظ„ظ„ط³ط¤ط§ظ„ ظˆط§ظ„ط¥ط¬ط§ط¨ط§طھ - ظ†ظپط³ ط§ظ„ط³ظ„ظˆظƒ ط¹ظ„ظ‰ ظƒظ„ ط§ظ„ط£ط¬ظ‡ط²ط©
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
      
      // ط§ظ„ط¨ط­ط« ط¹ظ† طµظˆطھ ط£ظ†ط«ظ‰ ط£ظˆظ„ط§ظ‹
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
      
      // ط¥ط°ط§ ظ„ظ… ظ†ط¬ط¯ طµظˆطھ ط£ظ†ط«ظ‰ ظ…ط­ط¯ط¯طŒ ظ†ط¨ط­ط« ط¹ظ† ط£ظٹ طµظˆطھ ط¨ط§ظ„ظ„ط؛ط© ط§ظ„ظ…ط·ظ„ظˆط¨ط©
      return voices.find(v => v.lang === speechLang)
        || voices.find(v => v.lang.startsWith(speechLang.split("-")[0]))
        || voices.find(v => v.lang === "nl-NL")
        || null;
    };

    // طھط­ظ‚ظ‚ ظ…ظ† طµظ„ط§ط­ظٹط© ط§ظ„ظ€ session ظ‚ط¨ظ„ ط£ظٹ ط¹ظ…ظ„
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
      u.rate = 0.3; // ط³ط±ط¹ط© ط£ط¨ط·ط£ ظ„ظ„ظˆط¶ظˆط­
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
      ? ["ط§ظ„ط¬ظˆط§ط¨ A:", "ط§ظ„ط¬ظˆط§ط¨ B:", "ط§ظ„ط¬ظˆط§ط¨ C:"]
      : lang === "fr"
      ? ["Rأ©ponse A:", "Rأ©ponse B:", "Rأ©ponse C:"]
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

  // طھط´ط؛ظٹظ„ ط§ظ„ظ‚ط±ط§ط،ط© ط¨ط¹ط¯ ط«ط§ظ†ظٹط© ظ…ظ† ظƒظ„ ط³ط¤ط§ظ„ ط¬ط¯ظٹط¯ - ظ†ظپط³ ط§ظ„ط³ظ„ظˆظƒ ط¹ظ„ظ‰ ظƒظ„ ط§ظ„ط£ط¬ظ‡ط²ط©
  useEffect(() => {
    if (!started || finished) return;
    killTts();
    setReadingDone(false);
    setHasReadCurrentQuestion(false);

    // ط¨ط¯ط، ط§ظ„ظ‚ط±ط§ط،ط© ط¨ط¹ط¯ ط«ط§ظ†ظٹط© ظˆط§ط­ط¯ط© ط¹ظ„ظ‰ ظƒظ„ ط§ظ„ط£ط¬ظ‡ط²ط©
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
          if (qData.success) {
            // ط­ط¯ 50 ط³ط¤ط§ظ„ ظ„ظƒظ„ ط§ظ…طھط­ط§ظ†
            const shuffled = qData.questions.sort(() => Math.random() - 0.5);
            setQuestions(shuffled.slice(0, 50));
          }
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
          // ط®ظ„ط· ط¹ط´ظˆط§ط¦ظٹ ط«ظ… ط£ط®ط° 50 ط³ط¤ط§ظ„ ظپظ‚ط·
          const shuffled = allQ.sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 50));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [cat]);

  // ظ…ط¤ظ‚طھ 15 ط«ط§ظ†ظٹط© - ظٹط¨ط¯ط£ ظپظ‚ط· ط¨ط¹ط¯ ط§ظ†طھظ‡ط§ط، ط§ظ„ظ‚ط±ط§ط،ط©
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

  // ظپطھط­ ظ‚ظ†ط§ط© ط§ظ„طµظˆطھ ط¹ظ†ط¯ ط£ظˆظ„ طھظپط§ط¹ظ„ (ظ…ط·ظ„ظˆط¨ ط¹ظ„ظ‰ iOS/Android)
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

  // طµظˆطھ "Bravo!" ط¹ظ†ط¯ ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط©
  const playApplause = () => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const bravoTexts: Record<string, string[]> = {
        nl: ["Bravo!", "Uitstekend!", "Geweldig!", "Perfect!"],
        fr: ["Bravo!", "Excellent!", "Parfait!", "Trأ¨s bien!"],
        ar: ["ط¨ط±ط§ظپظˆ!", "ظ…ظ…طھط§ط²!", "ط£ط­ط³ظ†طھ!", "ط±ط§ط¦ط¹!"],
        en: ["Bravo!", "Excellent!", "Well done!", "Perfect!"],
      };
      const options = bravoTexts[lang] || bravoTexts.nl;
      const text = options[Math.floor(Math.random() * options.length)];

      const u = new SpeechSynthesisUtterance(text);
      u.lang = { nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" }[lang] || "nl-NL";
      u.rate = 1.1;
      u.pitch = 1.4;
      u.volume = 1;

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
    } catch (e) { console.error('Bravo error:', e); }
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
    if (questions[currentIndex]?.correctAnswer === num) {
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

  // Hook ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¯ط§ط¦ظ…ط§ظ‹ ظ‚ط¨ظ„ ط£ظٹ return ظ…ط´ط±ظˆط·
  const textsToTranslate = q ? [
    q.textNL || q.text || "",
    q.answer1 || "",
    q.answer2 || "",
    q.answer3 || "",
  ] : ["", "", "", ""];
  const translatedTexts = useAutoTranslateList(textsToTranslate, lang);

  // Preload طµظˆط±ط© ط§ظ„ط³ط¤ط§ظ„ ط§ظ„طھط§ظ„ظٹ
  useEffect(() => {
    if (!questions.length) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) return;
    const nextQ = questions[nextIndex];
    if (!nextQ?.videoUrls?.length) return;
    nextQ.videoUrls.filter(Boolean).forEach((url: string) => {
      const img = new Image();
      const optimized = url.includes('res.cloudinary.com') && !url.includes('/upload/f_auto')
        ? url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
        : url;
      img.src = optimized;
    });
  }, [currentIndex, questions]);

  // ط­ظپط¸ ط¢ط®ط± طھط±ط¬ظ…ط© ظپظٹ ref
  useEffect(() => {
    translatedRef.current = translatedTexts;
  }, [translatedTexts]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // طµظپط­ط© ط§ظ„ط¨ط¯ط§ظٹط©
  if (!started) return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="border-4 border-[#003399] rounded-2xl p-10">
          <div className="text-6xl mb-4">ًںژ¯</div>
          <h1 className="text-2xl font-black text-[#003399] mb-2 uppercase">
            {lang === "ar" ? `ط§ظ…طھط­ط§ظ† ط§ظ„ظپط¦ط© ${cat}` : lang === "nl" ? `Examen Categorie ${cat}` : lang === "fr" ? `Examen Catأ©gorie ${cat}` : `Exam Category ${cat}`}
          </h1>
          <p className="text-gray-500 mb-2">{questions.length} {lang === "ar" ? "ط³ط¤ط§ظ„" : lang === "nl" ? "vragen" : lang === "fr" ? "questions" : "questions"}</p>
          <p className="text-sm text-orange-600 font-bold mb-8">
            âڈ± {lang === "ar" ? "15 ط«ط§ظ†ظٹط© ظ„ظƒظ„ ط³ط¤ط§ظ„" : lang === "nl" ? "15 seconden per vraag" : lang === "fr" ? "15 secondes par question" : "15 seconds per question"}
          </p>
          {questions.length === 0 ? (
            <p className="text-red-500 font-bold">{lang === "ar" ? "ظ„ط§ طھظˆط¬ط¯ ط£ط³ط¦ظ„ط© ط¨ط¹ط¯" : lang === "nl" ? "Geen vragen beschikbaar" : lang === "fr" ? "Pas encore de questions" : "No questions yet"}</p>
          ) : (
            <button onClick={() => { unlockAudio(); setStarted(true); }}
              className="px-10 py-4 font-black text-white text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              {lang === "ar" ? "ط§ط¨ط¯ط£ ط§ظ„ط§ظ…طھط­ط§ظ†" : lang === "nl" ? "Start Examen" : lang === "fr" ? "Dأ©marrer l'examen" : "Start Exam"} â†’
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // طµظپط­ط© ط§ظ„ظ†طھظٹط¬ط©
  if (finished) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = pct >= 60;
    const wrongAnswers = questions.filter((q, i) => answers[i] !== q.correctAnswer);
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

    return (
      <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* ط¨ط·ط§ظ‚ط© ط§ظ„ظ†طھظٹط¬ط© */}
          <div className={`rounded-2xl p-8 mb-6 text-center border-4 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
            <div className="text-6xl mb-3">{passed ? "ًںڈ†" : "ًںک”"}</div>
            <h1 className="text-2xl font-black mb-1" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {passed
                ? (lang === "ar" ? "ظ…ط¨ط±ظˆظƒ! ظ†ط¬ط­طھ" : lang === "nl" ? "Gefeliciteerd! Geslaagd!" : lang === "fr" ? "Fأ©licitations! Rأ©ussi!" : "Congratulations! Passed!")
                : (lang === "ar" ? "ظ„ظ… طھظ†ط¬ط­ ظ‡ط°ظ‡ ط§ظ„ظ…ط±ط©" : lang === "nl" ? "Helaas niet geslaagd" : lang === "fr" ? "Malheureusement pas rأ©ussi" : "Unfortunately not passed")}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "ط§ظ„ظ†ظ‚ط§ط·" : lang === "nl" ? "Behaald" : lang === "fr" ? "Points" : "Points"}
                </p>
                <p className="text-3xl font-black text-green-600">{score}</p>
                <p className="text-xs text-gray-400">/ {maxScore}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "طµط­" : lang === "nl" ? "Correct" : lang === "fr" ? "Correct" : "Correct"}
                </p>
                <p className="text-3xl font-black text-blue-600">{correctCount}</p>
                <p className="text-xs text-gray-400">/ {questions.length}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  {lang === "ar" ? "ط®ط·ط£" : lang === "nl" ? "Fout" : lang === "fr" ? "Faux" : "Wrong"}
                </p>
                <p className="text-3xl font-black text-red-500">{questions.length - correctCount}</p>
              </div>
              <div className="bg-white rounded-xl px-5 py-3 shadow text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Score</p>
                <p className="text-3xl font-black" style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</p>
              </div>
            </div>
          </div>

          {/* ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط®ط§ط·ط¦ط© */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm">âœ—</span>
                {lang === "ar" ? `ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط®ط§ط·ط¦ط© (${wrongAnswers.length})` : lang === "nl" ? `Foute antwoorden (${wrongAnswers.length})` : lang === "fr" ? `Mauvaises rأ©ponses (${wrongAnswers.length})` : `Wrong answers (${wrongAnswers.length})`}
              </h2>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[i];
                  const isCorrect = userAns === q.correctAnswer;
                  if (isCorrect) return null;

                  const timedOut = userAns === null || userAns === undefined;

                  return (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow border border-red-100">
                      {/* ط±ط£ط³ */}
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#fef2f2" }}>
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                        {q.points === 5 && (
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#dc2626" }}>â­گ 5 {lang === "ar" ? "ظ†ظ‚ط§ط·" : lang === "nl" ? "punten" : "pts"}</span>)}
                        {timedOut && (
                          <span className="text-xs font-black text-orange-500 flex items-center gap-1">
                            âڈ± {lang === "ar" ? "ط§ظ†طھظ‡ظ‰ ط§ظ„ظˆظ‚طھ" : lang === "nl" ? "Tijd verlopen" : lang === "fr" ? "Temps أ©coulأ©" : "Time out"}
                          </span>
                        )}
                      </div>

                      {/* طµظˆط±ط© */}
                      {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
                        <div className={`grid gap-1 p-1 bg-gray-100 grid-cols-2`}>
                          {q.videoUrls.filter(Boolean).map((url: string, idx: number) => (
                            <WatermarkedImage key={idx} src={url} />
                          ))}
                        </div>
                      )}

                      <div className="p-4">
                        {/* ظ†طµ ط§ظ„ط³ط¤ط§ظ„ */}
                        <p className="font-bold text-gray-800 mb-4 text-sm leading-relaxed">{q.textNL || q.text}</p>

                        {/* ط§ظ„ط¥ط¬ط§ط¨ط§طھ */}
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
                                  {isCorrectAns ? "âœ“" : isUserAns ? "âœ—" : num}
                                </span>
                                <span className="flex-1">{ansText}</span>
                                {isCorrectAns && (
                                  <span className="text-xs font-black text-green-600">
                                    {lang === "ar" ? "ط§ظ„طµط­ظٹط­ط©" : lang === "nl" ? "Correct" : lang === "fr" ? "Correct" : "Correct"}
                                  </span>
                                )}
                                {isUserAns && !isCorrectAns && (
                                  <span className="text-xs font-black text-red-500">
                                    {lang === "ar" ? "ط¥ط¬ط§ط¨طھظƒ" : lang === "nl" ? "Jouw antwoord" : lang === "fr" ? "Votre rأ©ponse" : "Your answer"}
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

          {/* ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„طµط­ظٹط­ط© */}
          {correctCount > 0 && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-black text-gray-500 flex items-center gap-2 mb-3 select-none">
                <span className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm">âœ“</span>
                {lang === "ar" ? `ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„طµط­ظٹط­ط© (${correctCount})` : lang === "nl" ? `Goede antwoorden (${correctCount})` : lang === "fr" ? `Bonnes rأ©ponses (${correctCount})` : `Correct answers (${correctCount})`}
              </summary>
              <div className="space-y-2 mt-2">
                {questions.map((q, i) => {
                  if (answers[i] !== q.correctAnswer) return null;
                  return (
                    <div key={i} className="bg-white rounded-xl px-4 py-3 border border-green-200 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-gray-700 flex-1 truncate">{q.textNL || q.text}</p>
                      {q.points === 5 && (
                        <span className="text-xs font-black text-red-500">â­گ 5</span>
                      )}
                      <span className="text-green-500 font-black text-sm">âœ“</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* ط£ط²ط±ط§ط± */}
          <div className="flex gap-3">
            <button onClick={() => { unlockAudio(); setStarted(false); setFinished(false); setCurrentIndex(0); setAnswers({}); setLocked(false); setQuestions(q => [...q].sort(() => Math.random() - 0.5).slice(0, 50)); }}
              className="flex-1 py-3 font-black text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              ًں”„ {lang === "ar" ? "ط¥ط¹ط§ط¯ط©" : lang === "nl" ? "Opnieuw" : lang === "fr" ? "Recommencer" : "Retry"}
            </button>
            <button onClick={() => router.back()}
              className="flex-1 py-3 font-black border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95">
              â†گ {lang === "ar" ? "ط±ط¬ظˆط¹" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // طµظپط­ط© ط§ظ„ط³ط¤ط§ظ„
  const userAnswer = answers[currentIndex];
  const isAnswered = userAnswer !== undefined;

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* طھط£ط«ظٹط± ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط© - ط¥ط´ط§ط±ط© طµط­ ط®ط¶ط±ط§ط، */}
      {showRoses && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500 opacity-10" />
          <div style={{ animation: "checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.95)", boxShadow: "0 0 60px rgba(34,197,94,0.7)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
          <style>{`
            @keyframes checkPop {
              0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
              60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* طھط£ط«ظٹط± ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„ط®ط§ط·ط¦ط© */}
      {showWrong && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl" style={{ animation: 'wrongBounce 0.3s ease-in-out 3' }}>
              â‌Œ
            </div>
          </div>
          <style>{`
            @keyframes wrongBounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.3); }
            }
          `}</style>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ط§ظ„ط³ط¤ط§ظ„ */}
        {q && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* ط±ط£ط³ ط§ظ„ط³ط¤ط§ظ„ - ط§ظ„ط¹ط¯ + ط§ظ„ظ…ط¤ظ‚طھ */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">
                  {currentIndex + 1} / {questions.length}
                </span>
                {/* ط´ط§ط±ط© 5 ظ†ظ‚ط§ط· */}
                {q.points === 5 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ background: "rgba(239,68,68,0.85)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                    â­گ 5 {lang === "ar" ? "ظ†ظ‚ط§ط·" : lang === "nl" ? "punten" : lang === "fr" ? "pts" : "pts"}
                  </span>
                )}
              </div>

              {/* ط§ظ„ظ…ط¤ظ‚طھ ط¨ط¬ط§ظ†ط¨ ط±ظ‚ظ… ط§ظ„ط³ط¤ط§ظ„ */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm border-2 transition-all ${
                locked ? "bg-white/20 border-white/40 text-white" :
                !readingDone ? "bg-blue-500 border-blue-300 text-white animate-pulse" :
                timeLeft <= 5 ? "bg-red-500 border-red-300 text-white animate-pulse" :
                timeLeft <= 10 ? "bg-orange-500 border-orange-300 text-white" :
                "bg-green-500 border-green-300 text-white"
              }`}>
                <span>{!readingDone && !locked ? "ًںژ§" : "âڈ±"}</span>
                <span className="text-lg">
                  {locked
                    ? (isAnswered && userAnswer !== null ? (userAnswer === q?.correctAnswer ? "âœ…" : "â‌Œ") : "âڈ±")
                    : !readingDone ? (lang === "ar" ? "ظ‚ط±ط§ط،ط©..." : lang === "nl" ? "Lezen..." : lang === "fr" ? "Lecture..." : "Reading...") : timeLeft}
                </span>
                {!locked && readingDone && <span className="text-xs opacity-80">s</span>}
              </div>
            </div>

            {/* ط§ظ„طµظˆط± */}
            {q.videoUrls && q.videoUrls.filter(Boolean).length > 0 && (
              <div className={`grid gap-1 p-2 bg-gray-100 grid-cols-2`}>
                {q.videoUrls.filter(Boolean).map((url: string, i: number) => (
                  <WatermarkedImage key={i} src={url} className="rounded-xl" />
                ))}
              </div>
            )}

            {/* ظ†طµ ط§ظ„ط³ط¤ط§ظ„ */}
            <div className="px-5 py-4 bg-white">
              <p className={`text-lg font-bold text-gray-900 leading-relaxed mb-3 ${isRtl ? "text-right" : "text-left"}`}>
                {translatedTexts[0] || q.textNL || q.text}
              </p>

              {/* ظ…ط¤ط´ط± ط­ط§ظ„ط© ط§ظ„ظ‚ط±ط§ط،ط© ظˆط§ظ„ظ…ط¤ظ‚طھ */}
              {/* ط§ظ„ط¥ط¬ط§ط¨ط§طھ */}
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
                        {isAnswered && userAnswer !== null ? (isCorrect ? "âœ“" : isSelected ? "âœ—" : label) : label}
                      </span>
                      <span className={isRtl ? "text-right flex-1" : "text-left flex-1"}>{ansText}</span>
                    </button>
                  );
                })}
              </div>

              {/* ط²ط± ط§ظ„طھط§ظ„ظٹ */}
              {(isAnswered || locked) && (
                <button onClick={handleNext}
                  className="w-full mt-5 py-3 font-black text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                  {currentIndex + 1 >= questions.length
                    ? (lang === "ar" ? "ط¹ط±ط¶ ط§ظ„ظ†طھظٹط¬ط© ًںڈ†" : lang === "nl" ? "Resultaat bekijken ًںڈ†" : lang === "fr" ? "Voir le rأ©sultat ًںڈ†" : "View Result ًںڈ†")
                    : (lang === "ar" ? "ط§ظ„طھط§ظ„ظٹ â†گ" : lang === "nl" ? "Volgende â†’" : lang === "fr" ? "Suivant â†’" : "Next â†’")}
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


