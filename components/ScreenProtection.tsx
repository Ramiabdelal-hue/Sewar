'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// دائماً يقرأ من localStorage في لحظة الاستدعاء (ليس عند التعريف)
function getEmail(): string | null {
  try { return localStorage.getItem('userEmail'); } catch { return null; }
}

function reportScreenshot(reason: string) {
  // يقرأ الـ email في لحظة الإرسال — ليس عند تعريف الدالة
  const email = getEmail();
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: email || null,
      eventType: 'screenshot_attempt',
      page: window.location.pathname + '?reason=' + reason,
    }),
  }).catch(() => {});
}

// منع التسجيل المتكرر لنفس السبب في فترة قصيرة
const recentReports: Record<string, number> = {};
function reportOnce(reason: string, cooldownMs = 3000) {
  const now = Date.now();
  if (recentReports[reason] && now - recentReports[reason] < cooldownMs) return;
  recentReports[reason] = now;
  reportScreenshot(reason);
}

export default function ScreenProtection() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    // ── 1. منع النسخ ─────────────────────────────────────────────────────────
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportOnce('copy-attempt');
    };

    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // ── 2. اختصارات لوحة المفاتيح ────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        reportOnce('print');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        reportOnce('copy-keyboard');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        return;
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        reportOnce('printscreen');
        return;
      }
      if (e.shiftKey && e.key === 'S' && (e.metaKey || (e.getModifierState && e.getModifierState('OS')))) {
        reportOnce('snipping');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        reportOnce('ctrl-shift-s');
        return;
      }
    };

    // ── 3. visibilitychange — فقط في الصفحات المحمية وبـ cooldown ────────────
    const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && isProtected) {
        // cooldown 10 ثوانٍ لتجنب التسجيل عند تبديل التطبيقات
        reportOnce('visibility-hidden', 10000);
      }
    };

    // ── 4. Right-click في الصفحات المحمية ────────────────────────────────────
    const onContextMenu = (e: MouseEvent) => {
      if (isProtected) {
        e.preventDefault();
        reportOnce('right-click', 5000);
      }
    };

    // ── 5. كشف DevTools ───────────────────────────────────────────────────────
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const isOpen =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        reportOnce('devtools-open', 30000);
      } else if (!isOpen) {
        devtoolsOpen = false;
      }
    };

    // ── 6. منع تحديد النص ────────────────────────────────────────────────────
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!isInput) e.preventDefault();
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('selectstart', onSelectStart);
    const devToolsInterval = setInterval(checkDevTools, 3000);

    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('selectstart', onSelectStart);
      clearInterval(devToolsInterval);
    };
  }, [pathname, isAdmin]);

  return null;
}
