// MyMemory Translation API - مجاني بدون مفتاح
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return text;
  
  // تحويل كود اللغة
  const langMap: Record<string, string> = {
    nl: "nl",
    fr: "fr",
    ar: "ar",
    en: "en",
  };
  
  const lang = langMap[targetLang] || "en";
  
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
    );
    const data = await res.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    return text;
  } catch {
    return text;
  }
}

// ترجمة مصفوفة من النصوص دفعة واحدة
export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const results = await Promise.all(texts.map(t => translateText(t, targetLang)));
  return results;
}
