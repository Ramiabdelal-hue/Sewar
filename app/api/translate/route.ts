import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/adminAuth";

// cache في الذاكرة لتجنب طلبات متكررة
const memCache: Record<string, string> = {};

// ── ترجمة نص عادي (بدون HTML) ────────────────────────────────────────────────
async function translatePlain(text: string, target: string): Promise<string> {
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

  // تنظيف مسافات فقط — لا نحذف HTML هنا
  translated = translated.replace(/[ \t]+/g, " ").trim();
  memCache[cacheKey] = translated;
  return translated;
}

// ── ترجمة HTML مع الحفاظ على التنسيق ────────────────────────────────────────
async function translateHtml(html: string, target: string): Promise<string> {
  if (!html?.trim()) return html;
  const cacheKey = `${target}::HTML::${html}`;
  if (memCache[cacheKey]) return memCache[cacheKey];

  // استخراج النصوص من داخل الـ tags فقط
  // نستبدل كل نص داخل tag بـ placeholder ونترجمه
  const textNodes: string[] = [];
  const placeholder = html.replace(/>([^<]+)</g, (match, textContent) => {
    const trimmed = textContent.trim();
    if (!trimmed) return match;
    textNodes.push(trimmed);
    return `>__T${textNodes.length - 1}__<`;
  });

  if (textNodes.length === 0) return html;

  // ترجمة كل النصوص دفعة واحدة
  const translated = await Promise.all(
    textNodes.map(t => translatePlain(t, target).catch(() => t))
  );

  // إعادة تجميع HTML مع النصوص المترجمة
  let result = placeholder;
  translated.forEach((t, i) => {
    result = result.replace(`>__T${i}__<`, `>${t}<`);
  });

  memCache[cacheKey] = result;
  return result;
}

// ── الدالة الرئيسية للترجمة ───────────────────────────────────────────────────
async function translateText(text: string, target: string): Promise<string> {
  if (!text?.trim()) return text;

  // إذا يحتوي HTML — احفظ التنسيق
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return translateHtml(text, target);
  }

  // نص عادي
  return translatePlain(text, target);
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
