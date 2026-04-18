"use client";
import { useState, useEffect } from "react";

const cache: Record<string, string> = {};

// تنظيف XML/HTML tags من النص
function cleanTranslation(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function translateOne(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "nl") return text;
  const key = `${text}__${targetLang}`;
  if (cache[key]) return cache[key];
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await res.json();
    if (data.success && data.translated) {
      const result = cleanTranslation(data.translated);
      cache[key] = result;
      return result;
    }
  } catch {}
  return text;
}

export function useAutoTranslate(text: string, targetLang: string) {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text) return;
    if (targetLang === "nl") { setTranslated(text); return; }
    translateOne(text, targetLang).then(setTranslated);
  }, [text, targetLang]);

  return translated;
}

export function useAutoTranslateList(texts: string[], targetLang: string) {
  const [translated, setTranslated] = useState<string[]>([]);
  const textsKey = texts.join("|||");

  useEffect(() => {
    if (!texts.length) { setTranslated([]); return; }
    if (targetLang === "nl") { setTranslated(texts); return; }

    // أولاً أعرض النصوص الأصلية فوراً
    setTranslated(texts);

    // ثم نترجم
    Promise.all(texts.map(t => translateOne(t, targetLang)))
      .then(results => setTranslated(results));
  }, [textsKey, targetLang]);

  return translated;
}
