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

    // إذا كان النص متعدد الأسطر، نترجم كل سطر على حدة للحفاظ على الترتيب
    const lines = text.split('\n');
    const hasMultipleLines = lines.length > 1;

    if (hasMultipleLines) {
      // ترجمة كل سطر غير فارغ
      const translatedLines = await Promise.all(
        lines.map(async (line) => {
          const trimmed = line.trim();
          if (!trimmed) return line; // أبقِ الأسطر الفارغة
          const lineUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=nl&tl=${target}&dt=t&q=${encodeURIComponent(trimmed)}`;
          try {
            const lineRes = await fetch(lineUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
            const lineData = await lineRes.json();
            if (Array.isArray(lineData) && Array.isArray(lineData[0])) {
              return lineData[0].filter((i: any) => i && i[0]).map((i: any) => i[0]).join("").replace(/<[^>]*>/g, "").trim();
            }
          } catch {}
          return trimmed;
        })
      );
      const result = translatedLines.join('\n');
      memCache[cacheKey] = result;
      return NextResponse.json({ success: true, translated: result });
    }

    // نص سطر واحد
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

    // تنظيف مع الحفاظ على السطور الجديدة
    translated = translated
      .replace(/<[^>]*>/g, "")   // إزالة HTML tags
      .replace(/[ \t]+/g, " ")   // تنظيف المسافات الأفقية فقط (لا \n)
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
