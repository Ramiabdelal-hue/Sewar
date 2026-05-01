/**
 * TTS Helper — Web Speech API
 * صوت بنت مجاني 100% مدمج في المتصفح
 */

const SPEECH_LANG_MAP: Record<string, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  ar: "ar-SA",
  en: "en-US",
};

export interface SpeakOptions {
  lang?: string;
  onEnd?: () => void;
  onError?: () => void;
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
  }
}

export function getFemaleVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const speechLang = SPEECH_LANG_MAP[lang] || "nl-NL";
  const langCode   = speechLang.split("-")[0];

  const femaleKeywords = [
    "female","woman","girl","fiona","samantha","victoria","karen",
    "moira","tessa","anna","sara","emma","sophie","claire","julie",
    "amelie","alice","marie","ellen","nora","zira","hazel","susan",
    "linda","laura","lotte","lea","zeina","joanna","salli","kendra",
    "kimberly","ivy","amy","emma","olivia","aria",
  ];

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

export function speak(text: string, options: SpeakOptions = {}): void {
  const { lang = "nl", onEnd, onError } = options;

  if (!text?.trim()) { onEnd?.(); return; }
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }

  const speechLang = SPEECH_LANG_MAP[lang] || "nl-NL";
  const u = new SpeechSynthesisUtterance(text);
  u.lang   = speechLang;
  u.rate   = 0.2;   // بطيء — درجة أبطأ من الأصلي 0.3
  u.pitch  = 1.2;   // نبرة أنثى
  u.volume = 1;

  const voice = getFemaleVoice(lang);
  if (voice) u.voice = voice;

  u.onend   = () => onEnd?.();
  u.onerror = () => { onError?.(); onEnd?.(); };

  window.speechSynthesis.speak(u);
}

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
