"use client";
import { useState, useEffect, useRef } from "react";

// Cache لتجنب إعادة الترجمة
const cache: Record<string, string> = {};

export function useAutoTranslate(text: string, targetLang: string, sourceLang = "nl") {
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    // إذا اللغة المستهدفة هي نفس المصدر، أرجع النص الأصلي
    if (targetLang === sourceLang || targetLang === "nl") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${text}__${targetLang}`;
    if (cache[cacheKey]) {
      setTranslated(cache[cacheKey]);
      return;
    }

    setLoading(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          cache[cacheKey] = data.translated;
          setTranslated(data.translated);
        }
      })
      .finally(() => setLoading(false));
  }, [text, targetLang]);

  return { translated, loading };
}

// ترجمة مصفوفة من النصوص
export function useAutoTranslateList(texts: string[], targetLang: string) {
  const [translated, setTranslated] = useState<string[]>(texts);
  const prevLang = useRef(targetLang);

  useEffect(() => {
    if (!texts.length) return;
    if (targetLang === "nl") { setTranslated(texts); return; }

    const translate = async () => {
      const results = await Promise.all(
        texts.map(async (text) => {
          if (!text) return text;
          const cacheKey = `${text}__${targetLang}`;
          if (cache[cacheKey]) return cache[cacheKey];
          
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, targetLang }),
            });
            const data = await res.json();
            if (data.success) {
              cache[cacheKey] = data.translated;
              return data.translated;
            }
          } catch {}
          return text;
        })
      );
      setTranslated(results);
    };

    translate();
  }, [texts.join("||"), targetLang]);

  return translated;
}
