import { NextRequest, NextResponse } from "next/server";

const langMap: Record<string, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  ar: "ar-SA",
  en: "en-US",
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const target = langMap[targetLang] || targetLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=nl-NL|${target}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      // تنظيف XML/HTML tags التي يُرجعها MyMemory أحياناً مثل <g x=1 id="46"/>
      const cleaned = data.responseData.translatedText
        .replace(/<[^>]*>/g, "")   // إزالة كل XML/HTML tags
        .replace(/\s+/g, " ")      // تنظيف المسافات الزائدة
        .trim();
      return NextResponse.json({ success: true, translated: cleaned });
    }

    return NextResponse.json({ success: false, translated: text });
  } catch {
    return NextResponse.json({ success: false, translated: "" }, { status: 500 });
  }
}
