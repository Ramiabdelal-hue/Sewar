'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getEmail() {
  try { return localStorage.getItem('userEmail'); } catch { return null; }
}

function reportScreenshot(reason: string) {
  const email = getEmail();
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: email,
      eventType: 'screenshot_attempt',
      page: window.location.pathname + '?reason=' + reason,
    }),
  }).catch(() => {});
}

export default function ScreenProtection() {
  const pathname = usePathname();

  // الأدمن مستثنى من كل الحماية
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    // ── 1. منع النسخ (Copy) في كل الصفحات ──────────────────────────────────
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportScreenshot('copy-attempt');
    };

    // ── 2. منع القص (Cut) ────────────────────────────────────────────────────
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // ── 3. منع الطباعة + تسجيل ──────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P أو Cmd+P (طباعة)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        reportScreenshot('print');
        return;
      }
      // Ctrl+C أو Cmd+C (نسخ)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        reportScreenshot('copy-keyboard');
        return;
      }
      // Ctrl+A أو Cmd+A (تحديد الكل)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        return;
      }
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        reportScreenshot('printscreen');
        return;
      }
      // Windows Snipping Tool: Win+Shift+S
      if (e.shiftKey && e.key === 'S' && (e.metaKey || (e.getModifierState && e.getModifierState('OS')))) {
        reportScreenshot('snipping');
        return;
      }
      // Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        reportScreenshot('ctrl-shift-s');
        return;
      }
    };

    // ── 4. كشف screenshot عبر visibilitychange (iOS/Android) ────────────────
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
        const isProtected = protectedPaths.some(p => pathname.startsWith(p));
        if (isProtected) {
          reportScreenshot('visibility-hidden');
        }
      }
    };

    // ── 5. منع Right-click على الصفحات المحمية ──────────────────────────────
    const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    const onContextMenu = (e: MouseEvent) => {
      if (isProtected) {
        e.preventDefault();
        reportScreenshot('right-click');
      }
    };

    // ── 6. كشف DevTools ──────────────────────────────────────────────────────
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const isOpen = widthDiff > threshold || heightDiff > threshold;
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        reportScreenshot('devtools-open');
      } else if (!isOpen) {
        devtoolsOpen = false;
      }
    };

    // ── 7. منع تحديد النص بالماوس ────────────────────────────────────────────
    const onSelectStart = (e: Event) => {
      // السماح بالتحديد في حقول الإدخال فقط
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!isInput) {
        e.preventDefault();
      }
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
