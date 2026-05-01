/**
 * TTS Helper — صوت بنت واضح مجاني عبر Puter.js (Amazon Polly Neural)
 * بدون API key أو تسجيل
 * https://developer.puter.com/tutorials/free-unlimited-text-to-speech-api/
 */

// أصوات أنثى لكل لغة في Amazon Polly
const POLLY_VOICES: Record<string, string> = {
  nl: "Lotte",   // هولندي — أنثى
  fr: "Lea",     // فرنسي — أنثى
  ar: "Zeina",   // عربي — أنثى
  en: "Joanna",  // إنجليزي — أنثى
};

const POLLY_LANG: Record<string, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  ar: "arb",
  en: "en-US",
};

let currentAudio: HTMLAudioElement | null = null;
let puterReady = false;

// تحميل Puter.js مرة واحدة
function loadPuter(): Promise<void> {
  return new Promise((resolve) => {
    if (puterReady || (window as any).puter) {
      puterReady = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.onload = () => { puterReady = true; resolve(); };
    script.onerror = () => resolve(); // fallback
    document.head.appendChild(script);
  });
}

export interface SpeakOptions {
  lang?: string;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * يوقف القراءة الحالية
 */
export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * ينطق النص بصوت بنت واضح عبر Puter.js
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const { lang = "nl", onEnd, onError } = options;

  if (!text?.trim()) { onEnd?.(); return; }

  stopSpeech();

  try {
    await loadPuter();
    const puter = (window as any).puter;

    if (puter?.ai?.txt2speech) {
      const voice  = POLLY_VOICES[lang] || "Joanna";
      const langCode = POLLY_LANG[lang] || "nl-NL";

      const audio: HTMLAudioElement = await puter.ai.txt2speech(text, {
        voice,
        engine: "neural",
        language: langCode,
      });

      currentAudio = audio;
      audio.onended = () => { currentAudio = null; onEnd?.(); };
      audio.onerror = () => { currentAudio = null; speakFallback(text, options); };
      await audio.play();
      return;
    }
  } catch {
    // fallback
  }

  speakFallback(text, options);
}

/**
 * Fallback: Web Speech API
 */
function speakFallback(text: string, options: SpeakOptions = {}): void {
  const { lang = "nl", onEnd, onError } = options;
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }

  const LANG_MAP: Record<string, string> = { nl: "nl-NL", fr: "fr-FR", ar: "ar-SA", en: "en-US" };
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = LANG_MAP[lang] || "nl-NL";
  u.rate  = 0.9;
  u.pitch = 1.1;

  const voices = window.speechSynthesis.getVoices();
  const female = voices.find(v =>
    v.lang.startsWith(u.lang.split("-")[0]) &&
    ["female","woman","girl","fiona","samantha","anna","sara","emma","ellen","nora","zira"]
      .some(k => v.name.toLowerCase().includes(k))
  ) || voices.find(v => v.lang.startsWith(u.lang.split("-")[0]));
  if (female) u.voice = female;

  u.onend   = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

/**
 * ينتظر جاهزية الأصوات
 */
export function whenVoicesReady(callback: () => void): void {
  // مع Puter.js لا نحتاج انتظار الأصوات
  callback();
}

export function getFemaleVoice(lang: string): SpeechSynthesisVoice | null {
  return null; // غير مستخدم مع Puter.js
}
