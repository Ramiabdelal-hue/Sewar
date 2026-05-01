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
    ]).then(([q, e]) => {
      setQText(q);
      setExpText(e);
      setTranslating(false);
    });
  }, [originalText, originalExplanation, lang]);

  const isRtl = lang === "ar";

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 underline font-bold break-all"
          onClick={e => e.stopPropagation()}>
          {"\uD83D\uDD17"} {part}
        </a>
      ) : part
    );
  };

  const ft: Record<string, { left: string; right: string }> = {
    nl: { left: "\u00A9 Alle rechten voorbehouden \u00B7 Sewar Rijbewijs Online", right: "\uD83D\uDEE1 Origineel educatief materiaal \u00B7 Wettelijk beschermd" },
    fr: { left: "\u00A9 Tous droits r\u00E9serv\u00E9s \u00B7 Sewar Rijbewijs Online", right: "\uD83D\uDEE1 Contenu \u00E9ducatif original \u00B7 Prot\u00E9g\u00E9 l\u00E9galement" },
    ar: { left: "\u00A9 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629 \u00B7 Sewar Rijbewijs Online", right: "\uD83D\uDEE1 \u0645\u062D\u062A\u0648\u0649 \u062A\u0639\u0644\u064A\u0645\u064A \u0623\u0635\u0644\u064A \u0645\u062D\u0645\u064A \u0642\u0627\u0646\u0648\u0646\u064A\u0627\u064B" },
    en: { left: "\u00A9 All rights reserved \u00B7 Sewar Rijbewijs Online", right: "\uD83D\uDEE1 Original educational content \u00B7 Legally protected" },
  };
  const text = ft[lang] || ft.nl;

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
          {index + 1}
        </div>
        {(question.textNL || question.text) && (
          <p className={`text-sm font-black text-white leading-snug flex-1 ${isRtl ? "text-right" : "text-left"}`}>
            {qText || question.textNL || question.text}
          </p>
        )}
        <span className="text-white/50 text-xs font-bold flex-shrink-0">{index + 1} / {total}</span>
      </div>

      {/* Images */}
      {question.videoUrls && question.videoUrls.filter(Boolean).length > 0 && (
        <div>
          {question.videoUrls.filter(Boolean).length === 1 ? (
            /* صورة واحدة - عرض كامل */
            <div className="relative select-none bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.videoUrls.filter(Boolean)[0]}
                alt=""
                style={{ width: "100%", height: "auto", display: "block" }}
                draggable={false}
                onContextMenu={e => e.preventDefault()}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/watermark.jpeg" alt="" className="absolute pointer-events-none"
                style={{ width: "40%", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-15deg)", opacity: 0.8, mixBlendMode: "multiply" }}
                draggable={false} />
            </div>
          ) : (
            /* صورتان - جنباً إلى جنب بنفس الارتفاع */
            <div className="grid bg-gray-100 p-1 gap-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {question.videoUrls.filter(Boolean).map((url, i) => (
                <div key={i} className="relative select-none rounded overflow-hidden" style={{ aspectRatio: "auto" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                    draggable={false}
                    onContextMenu={e => e.preventDefault()}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/watermark.jpeg" alt="" className="absolute pointer-events-none"
                    style={{ width: "50%", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-15deg)", opacity: 0.8, mixBlendMode: "multiply" }}
                    draggable={false} />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5"
            style={{ background: "linear-gradient(135deg, rgba(0,20,60,0.97), rgba(0,40,120,0.97))", fontSize: "9px", fontWeight: 700, direction: lang === "ar" ? "rtl" : "ltr" }}>
            <span className="text-white/80">{text.left}</span>
            <span className="text-white/80">{text.right}</span>
          </div>
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

      {/* Explanation */}
      {expText && (
        <div className="px-5 py-4 bg-white">
          {translating && <span className="text-xs text-gray-400 animate-pulse">...</span>}
          {expText.includes('\n') ? (
            <div className="space-y-1.5">
              {expText.split('\n').filter(line => line.trim()).map((line, i) => (
                <p key={i} className={`text-sm text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                  {renderTextWithLinks(line.trim())}
                </p>
              ))}
            </div>
          ) : (
            <p className={`text-sm text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>{renderTextWithLinks(expText)}</p>
          )}
        </div>
      )}

      {!expText && (!question.videoUrls || question.videoUrls.filter(Boolean).length === 0) && !question.audioUrl && (
        <div className="px-5 py-4 bg-white"></div>
      )}
    </div>
  );
}
