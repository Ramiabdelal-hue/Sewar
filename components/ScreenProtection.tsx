'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from '@/context/LangContext';

function getEmail(): string | null {
  try { return localStorage.getItem('userEmail'); } catch { return null; }
}

// ── cooldown عام: يمنع تسجيل أكثر من مرة واحدة كل 2 ثانية ──────────────────
let lastReportTime = 0;
const reasonCooldowns: Record<string, number> = {};

function canReport(reason: string, cooldownMs = 4000): boolean {
  const now = Date.now();
  // cooldown عام 2 ثانية بين أي تسجيلين
  if (now - lastReportTime < 2000) return false;
  // cooldown خاص بالسبب
  if (reasonCooldowns[reason] && now - reasonCooldowns[reason] < cooldownMs) return false;
  lastReportTime = now;
  reasonCooldowns[reason] = now;
  return true;
}

async function reportScreenshot(reason: string): Promise<number> {
  const email = getEmail();
  try {
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: email || null,
        eventType: 'screenshot_attempt',
        page: window.location.pathname + '?reason=' + reason,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.autoSuspended) {
      setTimeout(() => window.location.reload(), 2000);
    }
    return data.totalAttempts ?? 0;
  } catch {
    return 0;
  }
}

// ── مكون رسالة التحذير ───────────────────────────────────────────────────────
function WarningOverlay({ lang, onClose }: { lang: string; onClose: () => void }) {
  const isRtl = lang === 'ar';

  const messages: Record<string, { title: string; body: string; btn: string }> = {
    ar: {
      title: '⚠️ تحذير أمني',
      body: 'تم رصد محاولات تصوير الشاشة على حسابك.\n\nأنت تحت المراقبة الكاملة. الاستمرار في تصوير المحتوى المحمي سيؤدي إلى:\n• تعليق حسابك فوراً\n• ملاحقتك قانونياً بموجب قوانين حقوق الملكية الفكرية البلجيكية',
      btn: 'فهمت — لن أكرر ذلك',
    },
    nl: {
      title: '⚠️ Beveiligingswaarschuwing',
      body: 'Er zijn schermafbeeldingspogingen gedetecteerd op uw account.\n\nU staat onder volledige bewaking. Doorgaan met het fotograferen van beschermde inhoud leidt tot:\n• Onmiddellijke opschorting van uw account\n• Juridische vervolging op grond van Belgische auteursrechtwetten',
      btn: 'Begrepen — ik stop hiermee',
    },
    fr: {
      title: '⚠️ Avertissement de sécurité',
      body: 'Des tentatives de capture d\'écran ont été détectées sur votre compte.\n\nVous êtes sous surveillance complète. Continuer à photographier le contenu protégé entraînera:\n• La suspension immédiate de votre compte\n• Des poursuites judiciaires en vertu des lois belges sur le droit d\'auteur',
      btn: 'Compris — j\'arrête',
    },
    en: {
      title: '⚠️ Security Warning',
      body: 'Screenshot attempts have been detected on your account.\n\nYou are under full surveillance. Continuing to capture protected content will result in:\n• Immediate account suspension\n• Legal prosecution under Belgian intellectual property laws',
      btn: 'Understood — I will stop',
    },
  };

  const m = messages[lang] || messages.nl;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'white', border: '3px solid #ef4444' }}>
        <div className="px-5 py-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">🚨</div>
          <h2 className="text-white font-black text-base">{m.title}</h2>
        </div>
        <div className="px-5 py-4">
          {m.body.split('\n').map((line, i) => (
            <p key={i} className={`text-sm leading-relaxed ${
              line.startsWith('•') ? 'text-red-700 font-bold mt-1 ml-2'
              : line === '' ? 'mt-2'
              : 'text-gray-800 font-medium'}`}>
              {line}
            </p>
          ))}
          <div className="flex mt-4 rounded-full overflow-hidden h-1">
            <div className="flex-1" style={{ background: '#1a1a1a' }} />
            <div className="flex-1" style={{ background: '#f5a623' }} />
            <div className="flex-1" style={{ background: '#e63946' }} />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
            © Sewar Rijbewijs Online — Alle rechten voorbehouden
          </p>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
            {m.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── المكون الرئيسي ────────────────────────────────────────────────────────────
export default function ScreenProtection() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isAdmin = pathname.startsWith('/admin');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isAdmin) return;

    const WARN_THRESHOLD = 3;

    async function handleScreenshot(reason: string, cooldownMs = 4000) {
      if (!canReport(reason, cooldownMs)) return;
      const total = await reportScreenshot(reason);
      if (total >= WARN_THRESHOLD) {
        setShowWarning(true);
      }
    }

    // ── 1. PrintScreen (زر لقطة الشاشة المباشر) ──────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P / Cmd+P — طباعة
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleScreenshot('print');
        return;
      }
      // Ctrl+C / Cmd+C — نسخ (نمنعه فقط، التسجيل يتم في onCopy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        return;
      }
      // Ctrl+A — تحديد الكل (نمنعه فقط)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        return;
      }
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleScreenshot('printscreen');
        return;
      }
      // Win+Shift+S — أداة القص
      if (e.shiftKey && e.key === 'S' && (e.metaKey || (e.getModifierState && e.getModifierState('OS')))) {
        handleScreenshot('snipping', 5000);
        return;
      }
      // Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        handleScreenshot('ctrl-shift-s', 5000);
        return;
      }
    };

    // ── 2. Copy — فقط إذا كان هناك نص محدد يدوياً ──────────────────────────
    // نتجاهل copy إذا جاء خلال ثانية من PrintScreen (Windows يضع screenshot في clipboard)
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = window.getSelection()?.toString() || '';
      // يجب أن يكون هناك نص محدد يدوياً (أكثر من 3 أحرف لتجنب الـ false positives)
      if (selection.length > 3) {
        handleScreenshot('copy-text');
      }
    };

    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // ── 3. Visibility — موبايل فقط (iOS/Android) ────────────────────────────
    const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    // ── 4. Right-click — نمنعه فقط في الصفحات المحمية بدون تسجيل ─────────────
    const onContextMenu = (e: MouseEvent) => {
      if (isProtected) {
        e.preventDefault();
      }
    };

    // ── 5. منع تحديد النص ────────────────────────────────────────────────────
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!isInput) e.preventDefault();
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('selectstart', onSelectStart);

    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('selectstart', onSelectStart);
    };
  }, [pathname, isAdmin]);

  return (
    <>
      {showWarning && (
        <WarningOverlay lang={lang} onClose={() => setShowWarning(false)} />
      )}
    </>
  );
}
