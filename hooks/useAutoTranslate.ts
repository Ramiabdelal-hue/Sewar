"use client";
import { useState, useEffect, useRef } from "react";

// Cache في الذاكرة (يدوم طول الجلسة)
const memCache: Record<string, string> = {};

// تحميل cache من localStorage عند البداية
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("translateCache");
    if (stored) Object.assign(memCache, JSON.parse(stored));
  } catch {}
}

function saveCache() {
  try {
    localStorage.setItem("translateCache", JSON.stringify(memCache));
  } catch {}
}

function cleanTranslation(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// طابور الطلبات لتجميعها
const pendingRequests: Record<string, Promise<string>> = {};

async function translateOne(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "nl") return text;
  const key = `${targetLang}__${text}`;
  if (memCache[key]) return memCache[key];
  if (pendingRequests[key]) return pendingRequests[key];

  const promise = fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  })
    .then(res => res.json())
    .then(data => {
      const result = data.success && data.translated
        ? cleanTranslation(data.translated)
        : text;
      memCache[key] = result;
      delete pendingRequests[key];
      saveCache();
      return result;
    })
    .catch(() => { delete pendingRequests[key]; return text; });

  pendingRequests[key] = promise;
  return promise;
}

// ترجمة batch بطلب واحد
async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === "nl") return [...texts];

  // تحقق من الـ cache أولاً
  const needsTranslation: { index: number; text: string }[] = [];
  const results = texts.map((text, i) => {
    const key = `${targetLang}__${text}`;
    if (!text || memCache[key]) return memCache[key] || text;
    needsTranslation.push({ index: i, text });
    return text; // placeholder
  });

  if (needsTranslation.length === 0) return results;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: needsTranslation.map(n => n.text),
        targetLang,
      }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.translated)) {
      needsTranslation.forEach((item, i) => {
        const translated = cleanTranslation(data.translated[i] || item.text);
        results[item.index] = translated;
        memCache[`${targetLang}__${item.text}`] = translated;
      });
      saveCache();
    }
  } catch {}

  return results;
}

export function useAutoTranslate(text: string, targetLang: string) {
  const [translated, setTranslated] = useState(() => {
    if (!text || targetLang === "nl") return text;
    return memCache[`${targetLang}__${text}`] || text;
  });

  useEffect(() => {
    if (!text) return;
    if (targetLang === "nl") { setTranslated(text); return; }
    const key = `${targetLang}__${text}`;
    if (memCache[key]) { setTranslated(memCache[key]); return; }
    translateOne(text, targetLang).then(setTranslated);
  }, [text, targetLang]);

  return translated;
}

export function useAutoTranslateList(texts: string[], targetLang: string) {
  const textsKey = texts.join("|||");

  const getFromCache = () => {
    if (targetLang === "nl") return [...texts];
    return texts.map(t => (t && memCache[`${targetLang}__${t}`]) || t);
  };

  const [translated, setTranslated] = useState<string[]>(getFromCache);
  const prevKeyRef = useRef("");

  useEffect(() => {
    const stateKey = `${textsKey}__${targetLang}`;
    if (prevKeyRef.current === stateKey) return;
    prevKeyRef.current = stateKey;

    if (!texts.length) { setTranslated([]); return; }
    if (targetLang === "nl") { setTranslated([...texts]); return; }

    // عرض ما في الـ cache فوراً
    const cached = getFromCache();
    setTranslated(cached);

    // إذا كل النصوص في الـ cache، لا حاجة لطلب API
    const allCached = texts.every(t => !t || !!memCache[`${targetLang}__${t}`]);
    if (allCached) return;

    // طلب batch واحد لكل النصوص
    translateBatch(texts, targetLang).then(results => {
      setTranslated(results);
    });
  }, [textsKey, targetLang]);

  return translated;
}
