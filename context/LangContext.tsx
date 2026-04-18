"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "nl" | "fr" | "ar" | "en";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  // ابدأ بـ "nl" ثم اقرأ من localStorage بعد التحميل
  const [lang, setLangState] = useState<Lang>("nl");

  // عند أول تحميل: اقرأ اللغة المحفوظة
  useEffect(() => {
    const saved = localStorage.getItem("userLang") as Lang | null;
    if (saved && ["nl", "fr", "ar", "en"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  // عند تغيير اللغة: احفظها في localStorage
  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("userLang", newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
}
