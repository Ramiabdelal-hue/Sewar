import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/adminAuth";

// cache في الذاكرة لتجنب طلبات متكررة
const memCache: Record<string, string> = {};

async function translateText(text: string, target: string): Promise<string> {
  if (!text?.trim()) return text;
  const cacheKey = `${target}::${text}`;
  if (memCache[cacheKey]) return memCache[cacheKey];

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=nl&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error("Translation failed");
  const data = await res.json();

  let translated = "";
  if (Array.isArray(data) && Array.isArray(data[0])) {
    translated = data[0].filter((i: any) => i?.[0]).map((i: any) => i[0]).join("");
  }
  if (!translated) return text;

  translated = translated.replace(/<[^>]*>/g, "").replace(/[ \t]+/g, " ").trim();
  memCache[cacheKey] = translated;
  return translated;
}

export async function POST(req: NextRequest) {
  // Rate limit: max 60 translate requests per minute per IP
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 60, 60000)) {
    return NextResponse.json({ success: false, translated: "" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { targetLang } = body;

    if (!targetLang || targetLang === "nl") {
      // إذا batch
      if (Array.isArray(body.texts)) {
        return NextResponse.json({ success: true, translated: body.texts });
      }
      return NextResponse.json({ success: true, translated: body.text });
    }

    const gtLang: Record<string, string> = { fr: "fr", ar: "ar", en: "en", nl: "nl" };
    const target = gtLang[targetLang] || targetLang;

    // دعم batch: ترجمة مصفوفة نصوص بطلب واحد
    if (Array.isArray(body.texts)) {
      const results = await Promise.all(
        body.texts.map((text: string) => translateText(text, target).catch(() => text))
      );
      return NextResponse.json({ success: true, translated: results });
    }

    // ترجمة نص واحد
    const { text } = body;
    if (!text) return NextResponse.json({ success: true, translated: text });

    const result = await translateText(text, target);
    return NextResponse.json({ success: true, translated: result });

  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ success: false, translated: "" }, { status: 500 });
  }
}
