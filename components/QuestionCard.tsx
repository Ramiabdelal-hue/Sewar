"use client";

import { useState, useEffect } from "react";
import WatermarkedImage from "./WatermarkedImage";

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
    ]).then(([q, e]) => {
      setQText(q);
      setExpText(e);
      setTranslating(false);
    });
  }, [originalText, originalExplanation, lang]);

  const isRtl = lang === "ar";

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* شريط الرأس الأزرق - الرقم + العنوان */}
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
        {/* رقم الكرت */}
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
          {index + 1}
        </div>
        {/* العنوان بجانب الرقم */}
        {(question.textNL || question.text) && (
          <p className={`text-sm font-black text-white leading-snug flex-1 ${isRtl ? "text-right" : "text-left"}`}>
            {qText || question.textNL || question.text}
          </p>
        )}
        <span className="text-white/50 text-xs font-bold flex-shrink-0">{index + 1} / {total}</span>
      </div>

      {/* الصور */}
      {question.videoUrls && question.videoUrls.filter(Boolean).length > 0 && (() => {
        const urls = question.videoUrls!.filter(Boolean);
        const count = urls.length;
        const isOdd = count % 2 !== 0;
        const ft: Record<string, { left: string; right: string }> = {
          nl: { left: "© Alle rechten voorbehouden · SewarRijbewijsOnline", right: "🛡 Origineel educatief materiaal · Wettelijk beschermd" },
          fr: { left: "© Tous droits réservés · SewarRijbewijsOnline", right: "🛡 Contenu éducatif original · Protégé légalement" },
          ar: { left: "© جميع الحقوق محفوظة · SewarRijbewijsOnline", right: "🛡 محتوى تعليمي أصلي محمي قانونياً" },
          en: { left: "© All rights reserved · SewarRijbewijsOnline", right: "🛡 Original educational content · Legally protected" },
        };
        const text = ft[lang] || ft.nl;
        return (
          <div className="bg-gray-900">
            <div className={`grid gap-1 p-2 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {urls.map((url, i) => {
                const isLastOdd = isOdd && i === count - 1;
                return (
                  <div key={i}
                    className="relative rounded-xl overflow-hidden select-none"
                    style={isLastOdd ? { gridColumn: "1 / -1" } : {}}>
                    <WatermarkedImage src={url} className="w-full h-auto" />
                  </div>
                );
              })}
            </div>
            {/* شريط الحقوق — مرة واحدة أسفل كل الصور */}
            <div
              className="flex items-center justify-between px-3 py-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(0,20,60,0.97), rgba(0,40,120,0.97))",
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.02em",
                direction: lang === "ar" ? "rtl" : "ltr",
              }}>
              <span className="text-white/80">{text.left}</span>
              <span className="text-white/80">{text.right}</span>
            </div>
          </div>
        );
      })()}

      {/* Audio */}
      {question.audioUrl && (
        <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
          <audio controls className="w-full h-9">
            <source src={question.audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* الشرح */}
      {expText && (
        <div className="px-5 py-4 bg-white">
          {translating && <span className="text-xs text-gray-400 animate-pulse">...</span>}
          {expText.includes('\n') ? (
            <div className="space-y-1.5">
              {expText.split('\n').filter(line => line.trim()).map((line, i) => (
                <p key={i} className={`text-sm text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                  {line.trim()}
                </p>
              ))}
            </div>
          ) : (
            <p className={`text-sm text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>{expText}</p>
          )}
        </div>
      )}

      {!expText && (!question.videoUrls || question.videoUrls.filter(Boolean).length === 0) && !question.audioUrl && (
        <div className="px-5 py-4 bg-white"></div>
      )}
    </div>
  );
}
