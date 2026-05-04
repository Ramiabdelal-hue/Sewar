'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getEmail() {
  try { return localStorage.getItem('userEmail'); } catch { return null; }
}

function reportScreenshot(reason: string) {
  const email = getEmail();
  // سجّل دائماً حتى بدون email
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

  useEffect(() => {
    // ── 1. منع الطباعة + تسجيل ──────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P أو Cmd+P (طباعة)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        reportScreenshot('print');
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
      // Ctrl+Shift+S (بعض أدوات الـ screenshot)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        reportScreenshot('ctrl-shift-s');
        return;
      }
    };

    // ── 2. كشف screenshot عبر visibilitychange (iOS/Android) ────────────────
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // على iOS عند أخذ screenshot تختفي الصفحة لثانية
        // نسجّل فقط إذا كان المستخدم في صفحة محتوى
        const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
        const isProtected = protectedPaths.some(p => pathname.startsWith(p));
        if (isProtected) {
          reportScreenshot('visibility-hidden');
        }
      }
    };

    // ── 3. منع Right-click على الصفحات المحمية ──────────────────────────────
    const protectedPaths = ['/theorie/lesson', '/gratis/lesson', '/gratis/exam', '/examen', '/praktical'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    const onContextMenu = (e: MouseEvent) => {
      if (isProtected) {
        e.preventDefault();
        reportScreenshot('right-click');
      }
    };

    // ── 4. كشف DevTools (تغيير حجم النافذة المفاجئ) ─────────────────────────
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

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('contextmenu', onContextMenu);
    const devToolsInterval = setInterval(checkDevTools, 3000);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('contextmenu', onContextMenu);
      clearInterval(devToolsInterval);
    };
  }, [pathname]);

  return null;
}
