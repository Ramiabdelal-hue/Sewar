/**
 * TTS Helper — صوت أنثى طبيعي
 * يستخدم Google Translate TTS (مجاني، صوت طبيعي جداً)
 * مع Web Speech API كـ fallback
 */

const LANG_MAP: Record<string, string> = {
  nl: "nl",
  fr: "fr",
  ar: "ar",
  en: "en",
};

const SPEECH_LANG_MAP: Record<string, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  ar: "ar-SA",
  en: "en-US",
};

// cache الـ audio objects لتجنب إعادة التحميل
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * ينطق النص عبر Google Translate TTS (صوت أنثى طبيعي)
 * مع fallback لـ Web Speech API
 */
export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: () => void;
}

let currentAudio: HTMLAudioElement | null = null;

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
 * ينطق النص بصوت أنثى طبيعي عبر Google TTS
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  const { lang = "nl", onEnd, onError } = options;

  if (!text?.trim()) {
    onEnd?.();
    return;
  }

  stopSpeech();

  const langCode = LANG_MAP[lang] || "nl";
  // Google Translate TTS endpoint — صوت طبيعي جداً
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;

  const cacheKey = `${langCode}:${text}`;
  let audio = audioCache.get(cacheKey);

  if (!audio) {
    audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    // cache فقط النصوص القصيرة
    if (text.length < 200) audioCache.set(cacheKey, audio);
  } else {
    audio.currentTime = 0;
  }

  currentAudio = audio;

  audio.onended = () => {
    currentAudio = null;
    onEnd?.();
  };

  audio.onerror = () => {
    currentAudio = null;
    // fallback لـ Web Speech API
    speakFallback(text, options);
  };

  audio.play().catch(() => {
    // fallback إذا فشل التشغيل (CORS أو غيره)
    speakFallback(text, options);
  });
}

/**
 * Fallback: Web Speech API مع أفضل صوت أنثى متاح
 */
function speakFallback(text: string, options: SpeakOptions = {}): void {
  const { lang = "nl", rate = 0.9, pitch = 1.1, volume = 1, onEnd, onError } = options;

  if (!window.speechSynthesis) { onEnd?.(); return; }

  const speechLang = SPEECH_LANG_MAP[lang] || "nl-NL";
  const u = new SpeechSynthesisUtterance(text);
  u.lang   = speechLang;
  u.rate   = rate;
  u.pitch  = pitch;
  u.volume = volume;

  const voice = getFemaleVoice(lang);
  if (voice) u.voice = voice;

  u.onend   = () => onEnd?.();
  u.onerror = () => { onError?.() || onEnd?.(); };

  window.speechSynthesis.speak(u);
}

/**
 * يجلب أفضل صوت أنثى متاح
 */
export function getFemaleVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const speechLang = SPEECH_LANG_MAP[lang] || "nl-NL";
  const langCode   = speechLang.split("-")[0];

  const femaleKeywords = ["female","woman","girl","fiona","samantha","victoria","karen",
    "moira","tessa","veena","anna","sara","emma","sophie","claire","julie",
    "amelie","alice","marie","ellen","nora","zira","hazel","susan","linda","laura"];

  const isFemale = (v: SpeechSynthesisVoice) =>
    femaleKeywords.some(k => v.name.toLowerCase().includes(k));

  return (
    voices.find(v => v.localService && v.lang === speechLang && isFemale(v)) ||
    voices.find(v => v.lang === speechLang && isFemale(v)) ||
    voices.find(v => v.lang.startsWith(langCode) && isFemale(v)) ||
    voices.find(v => v.lang === speechLang) ||
    voices.find(v => v.lang.startsWith(langCode)) ||
    null
  );
}

/**
 * ينتظر تحميل الأصوات ثم ينفذ callback
 */
export function whenVoicesReady(callback: () => void): void {
  if (typeof window === "undefined") return;
  const voices = window.speechSynthesis?.getVoices();
  if (voices?.length > 0) { callback(); return; }
  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    callback();
  };
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = handler;
  setTimeout(handler, 1000);
}
