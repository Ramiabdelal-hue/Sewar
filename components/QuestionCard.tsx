"use client";

import { useState, useEffect } from "react";

const cache: Record<string, string> = {};

async function translateOne(text: string, lang: string): Promise<string> {
  if (!text || lang === "nl") return text;
  const key = `${text}__${lang}`;
  if (cache[key]) return cache[key];
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang }),
    });
    const data = await res.json();
    if (data.success) { cache[key] = data.translated; return data.translated; }
  } catch {}
  return text;
}

interface Question {
  id: number;
  text?: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  videoUrls?: string[];
  audioUrl?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
}

interface Props {
  question: Question;
  index: number;
  total: number;
  lang: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuestionCard({ question, index, total, lang, onNext, onPrev }: Props) {
  const originalText = question.textNL || question.textFR || question.textAR || question.text || "";
  const originalExplanation = question.explanationNL || question.explanationFR || question.explanationAR || "";

  const [qText, setQText] = useState(originalText);
  const [expText, setExpText] = useState(originalExplanation);
  const [translating, setTranslating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (lang === "nl") { setQText(originalText); setExpText(originalExplanation); return; }
    setTranslating(true);
    Promise.all([
      translateOne(originalText, lang),
      translateOne(originalExplanation, lang),
    ]).then(([q, e]) => { setQText(q); setExpText(e); }).finally(() => setTranslating(false));
  }, [originalText, originalExplanation, lang]);

  // إيقاف القراءة عند تغيير السؤال
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [index]);

  const speak = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(qText);
    utterance.rate = rate;
    utterance.lang = lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : lang === "en" ? "en-US" : "nl-NL";

    // اختيار صوت أنثوي
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.lang.startsWith(utterance.lang.split('-')[0]) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') ||
       v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Fiona') ||
       v.name.includes('Amelie') || v.name.includes('Ioana') || v.name.includes('Lekha'))
    ) || voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));

    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isRtl = lang === "ar";

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* شريط العنوان */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black">
            {index + 1}
          </div>
          <span className="text-white/80 text-sm font-bold">
            {lang === "ar" ? "السؤال" : lang === "nl" ? "Vraag" : lang === "fr" ? "Question" : "Question"}
            {translating && <span className="ml-2 animate-pulse">...</span>}
          </span>
        </div>
        <span className="text-white/60 text-sm font-bold">{index + 1} / {total}</span>
      </div>

      {/* الصور */}
      {question.videoUrls && question.videoUrls.filter(Boolean).length > 0 && (
        <div className={`grid gap-1 bg-gray-900 p-2 ${question.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {question.videoUrls.filter(Boolean).map((url, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl select-none"
              style={{ aspectRatio: question.videoUrls!.filter(Boolean).length === 1 ? "16/9" : "4/3" }}>
              <img src={url} alt={`img ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              {/* Watermark شبكي */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 60px,
                    rgba(255,255,255,0.08) 60px,
                    rgba(255,255,255,0.08) 61px
                  )`,
                }}>
              </div>
              {/* Logo watermark في الزاوية */}
              <div className="absolute bottom-2 right-2 pointer-events-none select-none opacity-60">
                <img src="/logo.jpg" alt="Sewar" 
                  style={{ width: '50px', height: '50px', objectFit: 'contain', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              {/* رقم الصورة */}
              {question.videoUrls!.filter(Boolean).length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {i + 1}/{question.videoUrls!.filter(Boolean).length}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Audio */}
      {question.audioUrl && (
        <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
          <audio controls className="w-full h-9">
            <source src={question.audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* نص السؤال */}
      <div className="px-5 py-5 bg-white">
        {/* أزرار القراءة والسرعة */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <button
            onClick={speak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              speaking
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"
            }`}
          >
            {speaking ? (
              <>⏹ {lang === "ar" ? "إيقاف" : lang === "nl" ? "Stop" : lang === "fr" ? "Arrêt" : "Stop"}</>
            ) : (
              <>🔊 {lang === "ar" ? "اقرأ" : lang === "nl" ? "Lees voor" : lang === "fr" ? "Lire" : "Read"}</>
            )}
          </button>

          {/* أزرار السرعة */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 font-bold">
              {lang === "ar" ? "السرعة:" : lang === "nl" ? "Snelheid:" : lang === "fr" ? "Vitesse:" : "Speed:"}
            </span>
            {[0.5, 0.75, 1, 1.25, 1.5].map(r => (
              <button
                key={r}
                onClick={() => { setRate(r); if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); } }}
                className={`px-2 py-0.5 text-xs font-black rounded border transition-all ${
                  rate === r
                    ? "bg-[#003399] text-white border-[#003399]"
                    : "bg-white text-gray-500 border-gray-300 hover:border-[#003399]"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 mb-1">
          <span className="w-1 h-5 bg-[#003399] rounded-full flex-shrink-0 mt-1"></span>
          <p className={`text-lg font-bold text-gray-900 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
            {qText}
          </p>
        </div>

        {/* الشرح */}
        {expText && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full flex-shrink-0 mt-1"></span>
              <div>
                <p className="text-xs font-black text-green-700 uppercase tracking-wider mb-1">
                  {lang === "ar" ? "الشرح" : lang === "nl" ? "Uitleg" : lang === "fr" ? "Explication" : "Explanation"}
                </p>
                <p className={`text-sm text-green-900 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                  {expText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* أزرار التنقل */}
      <div className="flex border-t border-gray-100">
        <button onClick={onPrev} disabled={index === 0}
          className={`flex-1 py-4 font-black text-sm transition-all flex items-center justify-center gap-1 border-r border-gray-100 ${
            index === 0 ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-[#003399] bg-white hover:bg-[#ddeeff] active:scale-95"
          }`}>
          ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : lang === "fr" ? "Précédent" : "Previous"}
        </button>
        <button onClick={onNext} disabled={index === total - 1}
          className={`flex-1 py-4 font-black text-sm transition-all flex items-center justify-center gap-1 ${
            index === total - 1 ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-white active:scale-95"
          }`}
          style={index < total - 1 ? { background: "linear-gradient(135deg, #003399, #0055cc)" } : {}}>
          {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : lang === "fr" ? "Suivant" : "Next"} →
        </button>
      </div>
    </div>
  );
}
