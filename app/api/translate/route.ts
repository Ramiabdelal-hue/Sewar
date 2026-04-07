import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();
    
    if (!text || !targetLang) {
      return NextResponse.json({ success: false, message: "text and targetLang required" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`
    );
    const data = await res.json();

    if (data.responseStatus === 200) {
      return NextResponse.json({ success: true, translated: data.responseData.translatedText });
    }

    return NextResponse.json({ success: false, translated: text });
  } catch (e) {
    return NextResponse.json({ success: false, translated: "" }, { status: 500 });
  }
}
