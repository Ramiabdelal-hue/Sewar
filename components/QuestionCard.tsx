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

  useEffect(() => {
    if (lang === "nl") { setQText(originalText); setExpText(originalExplanation); return; }
    setTranslating(true);
    Promise.all([
      translateOne(originalText, lang),
      translateOne(originalExplanation, lang),
    ]).then(([q, e]) => { setQText(q); setExpText(e); }).finally(() => setTranslating(false));
  }, [originalText, originalExplanation, lang]);

  const isRtl = lang === "ar";

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* شريط الرأس */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black">
            {index + 1}
          </div>
        </div>
        <span className="text-white/60 text-sm font-bold">{index + 1} / {total}</span>
      </div>

      {/* عنوان الشرح فوق الصورة مباشرة */}
      {(question.textNL || question.text) && (
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          <span className="text-white text-base flex-shrink-0">📌</span>
          <p className={`text-sm font-black text-white leading-snug ${isRtl ? "text-right" : "text-left"}`}>
            {translating ? (question.textNL || question.text) : qText}
          </p>
        </div>
      )}

      {/* الصور - متصلة مباشرة بالعنوان */}
      {question.videoUrls && question.videoUrls.filter(Boolean).length > 0 && (
        <div className={`grid gap-1 bg-gray-900 p-2 ${question.videoUrls.filter(Boolean).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {question.videoUrls.filter(Boolean).map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden select-none">
              <img src={url} alt={`img ${i + 1}`}
                className="w-full h-auto"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              {/* Logo watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <img src="/logo.png" alt="Sewar"
                  style={{ width: '50%', height: '50%', objectFit: 'contain', opacity: 0.75, mixBlendMode: 'screen', transform: 'rotate(-15deg)' }}
                  draggable={false} onContextMenu={(e) => e.preventDefault()}
                />
              </div>
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

      {/* الشرح - متصل بالصورة */}
      {expText && (
        <div className="px-5 py-4 bg-green-50">
          <p className="text-xs font-black text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {lang === "ar" ? "الشرح" : lang === "nl" ? "Uitleg" : lang === "fr" ? "Explication" : "Explanation"}
            {translating && <span className="text-green-400 animate-pulse">...</span>}
          </p>
          {expText.includes('\n') ? (
            <div className="space-y-1.5">
              {expText.split('\n').filter(line => line.trim()).map((line, i) => (
                <p key={i} className={`text-sm text-green-900 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                  {line.trim()}
                </p>
              ))}
            </div>
          ) : (
            <p className={`text-sm text-green-900 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>{expText}</p>
          )}
        </div>
      )}

      {/* إذا لا يوجد شرح ولا صورة */}
      {!expText && (!question.videoUrls || question.videoUrls.filter(Boolean).length === 0) && !question.audioUrl && (
        <div className="px-5 py-4 bg-white"></div>
      )}
    </div>
  );
}
