/**
 * TTS Helper — صوت أنثى مجاني عبر Web Speech API
 * يختار أفضل صوت أنثى متاح حسب اللغة
 */

const LANG_MAP: Record<string, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  ar: "ar-SA",
  en: "en-US",
};

/**
 * يجلب أفضل صوت أنثى متاح للغة المطلوبة
 * الأولوية: صوت أنثى محلي → صوت أنثى أي → أول صوت للغة
 */
export function getFemaleVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const speechLang = LANG_MAP[lang] || "nl-NL";
  const langCode   = speechLang.split("-")[0];

  // أسماء أصوات أنثى معروفة
  const femaleNames = [
    "female", "woman", "girl", "fiona", "samantha", "victoria", "karen",
    "moira", "tessa", "veena", "ioana", "joana", "paulina", "amelie",
    "alice", "marie", "anna", "sara", "lekha", "zira", "hazel", "susan",
    "linda", "laura", "emma", "sophie", "claire", "julie", "isabelle",
    "nora", "ellen", "xander", "google.*female",
    // هولندي
    "xander", "ellen", "fiona",
    // عربي
    "laila", "maged", "tarik",
    // فرنسي
    "amelie", "thomas",
  ];

  const isFemale = (v: SpeechSynthesisVoice) =>
    femaleNames.some(n => v.name.toLowerCase().includes(n));

  // 1. صوت أنثى محلي (localService) باللغة المطلوبة
  const localFemale = voices.find(
    v => v.localService && v.lang === speechLang && isFemale(v)
  );
  if (localFemale) return localFemale;

  // 2. صوت أنثى باللغة المطلوبة (غير محلي)
  const remoteFemale = voices.find(
    v => v.lang === speechLang && isFemale(v)
  );
  if (remoteFemale) return remoteFemale;

  // 3. أي صوت أنثى بنفس اللغة (مثلاً nl-BE بدل nl-NL)
  const anyFemale = voices.find(
    v => v.lang.startsWith(langCode) && isFemale(v)
  );
  if (anyFemale) return anyFemale;

  // 4. أول صوت باللغة المطلوبة
  const anyLang = voices.find(v => v.lang === speechLang)
    || voices.find(v => v.lang.startsWith(langCode));
  if (anyLang) return anyLang;

  return null;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;   // 0.5–2.0 (1.0 = طبيعي)
  pitch?: number;  // 0.5–2.0 (1.1 = أنثى أوضح)
  volume?: number; // 0–1
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * ينطق النص بصوت أنثى
 */
export function speak(text: string, options: SpeakOptions = {}): SpeechSynthesisUtterance {
  const {
    lang    = "nl",
    rate    = 0.9,
    pitch   = 1.1,
    volume  = 1,
    onEnd,
    onError,
  } = options;

  const u = new SpeechSynthesisUtterance(text);
  u.lang   = LANG_MAP[lang] || "nl-NL";
  u.rate   = rate;
  u.pitch  = pitch;
  u.volume = volume;

  const voice = getFemaleVoice(lang);
  if (voice) u.voice = voice;

  if (onEnd)   u.onend   = onEnd;
  if (onError) u.onerror = onError;

  window.speechSynthesis.speak(u);
  return u;
}

/**
 * يوقف القراءة
 */
export function stopSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
  }
}

/**
 * ينتظر تحميل الأصوات ثم ينفذ callback
 */
export function whenVoicesReady(callback: () => void): void {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    callback();
    return;
  }
  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    window.speechSynthesis.onvoiceschanged = null;
    callback();
  };
  window.speechSynthesis.onvoiceschanged = handler;
  setTimeout(handler, 1500); // fallback
}
