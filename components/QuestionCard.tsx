"use client";

import { useState, useEffect, useRef } from "react";

// Cache مشترك في الذاكرة + localStorage
const memCache: Record<string, string> = {};
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("translateCache");
    if (stored) Object.assign(memCache, JSON.parse(stored));
  } catch {}
}
function saveCache() {
  try { localStorage.setItem("translateCache", JSON.stringify(memCache)); } catch {}
}

async function translateOne(text: string, lang: string): Promise<string> {
  if (!text || lang === "nl") return text;
  const key = `${lang}__${text}`;
  if (memCache[key]) return memCache[key];
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // نرسل النص كاملاً مع HTML إذا وُجد
      body: JSON.stringify({ text, targetLang: lang }),
    });
    const data = await res.json();
    if (data.success && data.translated) {
      memCache[key] = data.translated;
      saveCache();
      return data.translated;
    }
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

/** مكون يعرض صورتين أو أكثر في grid متساوي.
 *  كل صورة تملأ خليتها بالكامل بدون قص ولا فراغات.
 *  الارتفاع الموحد = أكبر ارتفاع طبيعي بين الصور بعد تحجيمها لعرض الخلية. */
function MultiImageGrid({ urls }: { urls: string[] }) {
  const [cellHeight, setCellHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!urls.length) return;

    const loadImage = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 1, h: 1 });
        img.src = url;
      });

    Promise.all(urls.map(loadImage)).then((dims) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      // عرض كل خلية = نصف عرض الـ container (بدون gap أو padding)
      const cellWidth = containerWidth / 2;
      // نحسب الارتفاع الذي ستأخذه كل صورة بعد تمددها لعرض الخلية
      const heights = dims.map(({ w, h }) => (h / w) * cellWidth);
      // نأخذ أكبر ارتفاع مع تصغير 25%
      const maxHeight = Math.max(...heights) * 0.75;
      setCellHeight(Math.round(maxHeight));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join(",")]);

  return (
    <div
      ref={containerRef}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
    >
      {urls.map((url, i) => (
        <div
          key={i}
          className="select-none"
          style={{
            height: cellHeight ? `${cellHeight}px` : "200px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill", // يمدد الصورة لتملأ الخلية بالكامل بدون قص ولا فراغ
            }}
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
        </div>
      ))}
    </div>
  );
}

export default function QuestionCard({ question, index, total, lang, onNext, onPrev }: Props) {
  // ── اختيار النص الأصلي حسب اللغة أولاً، ثم fallback للهولندية ──
  const getOriginalText = () => {
    if (lang === "fr" && question.textFR) return { text: question.textFR, needsTranslation: false };
    if (lang === "ar" && question.textAR) return { text: question.textAR, needsTranslation: false };
    return { text: question.textNL || question.text || "", needsTranslation: lang !== "nl" };
  };

  const getOriginalExplanation = () => {
    if (lang === "fr" && question.explanationFR) return { text: question.explanationFR, needsTranslation: false };
    if (lang === "ar" && question.explanationAR) return { text: question.explanationAR, needsTranslation: false };
    return { text: question.explanationNL || "", needsTranslation: lang !== "nl" };
  };

  const { text: origText, needsTranslation: textNeedsTranslation } = getOriginalText();
  const { text: origExp, needsTranslation: expNeedsTranslation } = getOriginalExplanation();

  // ── تحميل من الـ cache فوراً بدون انتظار ──
  const getCached = (text: string, needsTranslation: boolean) => {
    if (!needsTranslation || !text) return text;
    return memCache[`${lang}__${text}`] || text;
  };

  const [qText, setQText] = useState(() => getCached(origText, textNeedsTranslation));
  const [expText, setExpText] = useState(() => getCached(origExp, expNeedsTranslation));
  const [translating, setTranslating] = useState(false);
  const prevLangRef = useRef(lang);
  const prevIdRef = useRef(question.id);

  useEffect(() => {
    const langChanged = prevLangRef.current !== lang;
    const questionChanged = prevIdRef.current !== question.id;
    prevLangRef.current = lang;
    prevIdRef.current = question.id;

    // تحديث النصوص الأصلية فوراً من الـ cache
    const cachedQ = getCached(origText, textNeedsTranslation);
    const cachedE = getCached(origExp, expNeedsTranslation);
    setQText(cachedQ);
    setExpText(cachedE);

    // إذا لا حاجة للترجمة
    if (!textNeedsTranslation && !expNeedsTranslation) return;
    if (lang === "nl") return;

    // تحقق إذا كل شيء موجود في الـ cache
    const qCached = !textNeedsTranslation || !origText || !!memCache[`${lang}__${origText}`];
    const eCached = !expNeedsTranslation || !origExp || !!memCache[`${lang}__${origExp}`];
    if (qCached && eCached) return; // لا حاجة لطلب API

    setTranslating(true);
    const promises: Promise<string>[] = [
      textNeedsTranslation && origText ? translateOne(origText, lang) : Promise.resolve(origText),
      expNeedsTranslation && origExp ? translateOne(origExp, lang) : Promise.resolve(origExp),
    ];

    Promise.all(promises).then(([q, e]) => {
      setQText(q);
      setExpText(e);
      setTranslating(false);
    });
  }, [lang, question.id, origText, origExp]);

  const isRtl = lang === "ar";

  const renderContent = (text: string) => {
    if (!text) return null;

    // HTML من RichTextEditor
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return (
        <div
          className={`text-base font-bold text-gray-800 leading-relaxed rich-content ${isRtl ? "text-right" : "text-left"}`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    // نص عادي مع سطور متعددة
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      return (
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <p key={i} className={`text-base font-bold text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
              {renderLinks(line.trim())}
            </p>
          ))}
        </div>
      );
    }

    return (
      <p className={`text-base font-bold text-gray-800 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
        {renderLinks(text)}
      </p>
    );
  };

  const renderLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 underline font-bold break-all"
          onClick={e => e.stopPropagation()}>
          🔗 {part}
        </a>
      ) : part
    );
  };

  const ft: Record<string, { left: string; right: string }> = {
    nl: { left: "© Alle rechten voorbehouden · Sewar Rijbewijs Online", right: "🛡 Origineel educatief materiaal · Wettelijk beschermd" },
    fr: { left: "© Tous droits réservés · Sewar Rijbewijs Online", right: "🛡 Contenu éducatif original · Protégé légalement" },
    ar: { left: "© جميع الحقوق محفوظة · Sewar Rijbewijs Online", right: "🛡 محتوى تعليمي أصلي محمي قانونياً" },
    en: { left: "© All rights reserved · Sewar Rijbewijs Online", right: "🛡 Original educational content · Legally protected" },
  };
  const footerText = ft[lang] || ft.nl;

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header — يظهر فقط إذا يوجد textNL/text (عنوان السؤال) */}
      {(question.textNL || question.text) && (
        <div className="flex items-center gap-3 px-5 py-3"
          style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
            {index + 1}
          </div>
          <p className={`text-base font-bold text-white leading-snug flex-1 ${isRtl ? "text-right" : "text-left"}`}>
            {translating && !memCache[`${lang}__${origText}`]
              ? <span className="opacity-70">{origText}</span>
              : qText || origText}
          </p>
          <span className="text-white/50 text-xs font-bold flex-shrink-0">{index + 1} / {total}</span>
        </div>
      )}

      {/* رقم السؤال إذا لا يوجد عنوان (نقاط/شرح فقط) */}
      {!question.textNL && !question.text && (
        <div className="flex items-center gap-3 px-5 py-2.5"
          style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
            {index + 1}
          </div>
          <span className="text-white/50 text-xs font-bold">{index + 1} / {total}</span>
        </div>
      )}

      {/* Images */}
      {question.videoUrls && question.videoUrls.filter(Boolean).length > 0 && (
        <div>
          {question.videoUrls.filter(Boolean).length === 1 ? (
            /* صورة واحدة — الصندوق بارتفاع محدود والصورة تملأه بالكامل */
            <div className="relative select-none" style={{ height: "220px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.videoUrls.filter(Boolean)[0]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                draggable={false}
                onContextMenu={e => e.preventDefault()}
              />
            </div>
          ) : (
            /* صورتان أو أكثر — grid متساوي، الارتفاع يتكيف مع أكبر صورة */
            <MultiImageGrid urls={question.videoUrls.filter(Boolean)} />
          )}
          <div className="flex items-center justify-between px-3 py-1.5"
            style={{ background: "linear-gradient(135deg, rgba(0,20,60,0.97), rgba(0,40,120,0.97))", fontSize: "9px", fontWeight: 700, direction: lang === "ar" ? "rtl" : "ltr" }}>
            <span className="text-white/80">{footerText.left}</span>
            <span className="text-white/80">{footerText.right}</span>
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

      {/* المحتوى الرئيسي: explanationNL أو النص */}
      {expText && (
        <div className="px-5 py-4 bg-white">
          {/* مؤشر الترجمة — خفي لا يغير المحتوى */}
          {translating && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-medium">
                {lang === "ar" ? "جاري الترجمة..." : lang === "nl" ? "" : "Traduction..."}
              </span>
            </div>
          )}
          {renderContent(expText)}
        </div>
      )}

      {/* إذا لا يوجد شرح ولا صور ولا صوت — مساحة فارغة صغيرة */}
      {!expText && (!question.videoUrls || question.videoUrls.filter(Boolean).length === 0) && !question.audioUrl && (
        <div className="px-5 py-4 bg-white" />
      )}
    </div>
  );
}
