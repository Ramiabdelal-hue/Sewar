import { NextRequest, NextResponse } from "next/server";

// cache في الذاكرة لتجنب طلبات متكررة
const memCache: Record<string, string> = {};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang || targetLang === "nl") {
      return NextResponse.json({ success: true, translated: text });
    }

    const cacheKey = `${targetLang}::${text}`;
    if (memCache[cacheKey]) {
      return NextResponse.json({ success: true, translated: memCache[cacheKey] });
    }

    // خريطة اللغات لـ Google Translate
    const gtLang: Record<string, string> = {
      fr: "fr",
      ar: "ar",
      en: "en",
      nl: "nl",
    };

    const target = gtLang[targetLang] || targetLang;

    // استخدام Google Translate غير الرسمي (أدق من MyMemory)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=nl&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) throw new Error("Translation failed");

    const data = await res.json();

    // Google Translate يرجع array متداخل
    let translated = "";
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0]
        .filter((item: any) => item && item[0])
        .map((item: any) => item[0])
        .join("");
    }

    if (!translated) {
      return NextResponse.json({ success: false, translated: text });
    }

    // تنظيف
    translated = translated
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    memCache[cacheKey] = translated;
    return NextResponse.json({ success: true, translated });

  } catch (error) {
    console.error("Translation error:", error);
    // fallback إلى MyMemory
    try {
      const { text, targetLang } = await req.json().catch(() => ({ text: "", targetLang: "fr" }));
      const langMap: Record<string, string> = { fr: "fr-FR", ar: "ar-SA", en: "en-US" };
      const target = langMap[targetLang] || targetLang;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=nl-NL|${target}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const cleaned = data.responseData.translatedText.replace(/<[^>]*>/g, "").trim();
        return NextResponse.json({ success: true, translated: cleaned });
      }
    } catch {}
    return NextResponse.json({ success: false, translated: "" }, { status: 500 });
  }
}
