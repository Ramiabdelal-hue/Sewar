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
              {/* Text watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div style={{ textAlign: 'center', opacity: 0.35, transform: 'rotate(-10deg)' }}>
                  <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', fontStyle: 'italic', fontFamily: 'Georgia, serif', textShadow: '1px 1px 3px rgba(0,0,0,0.5)', letterSpacing: '0.05em' }}>Sewar</div>
                  <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '400', fontFamily: 'Arial, sans-serif', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', letterSpacing: '0.1em', marginTop: '2px' }}>Verkeersschool</div>
                </div>
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

      {/* الشرح فقط - بدون نص السؤال */}
      {expText && (
        <div className="px-5 py-5 bg-white">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
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
        </div>
      )}

      {/* إذا لا يوجد شرح ولا صورة - مساحة فارغة صغيرة */}
      {!expText && (!question.videoUrls || question.videoUrls.filter(Boolean).length === 0) && !question.audioUrl && (
        <div className="px-5 py-4 bg-white"></div>
      )}

      {/* أزرار التنقل محذوفة - موجودة في الصفحة الأم */}
    </div>
  );
}
