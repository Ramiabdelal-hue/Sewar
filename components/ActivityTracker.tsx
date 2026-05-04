'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ActivityTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>('');

  function getEmail() {
    try { return localStorage.getItem('userEmail'); } catch { return null; }
  }

  function track(eventType: string, page?: string) {
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: getEmail(),
        eventType,
        page: page || window.location.pathname,
      }),
    }).catch(() => {});
  }

  // تتبع تغيير الصفحة
  useEffect(() => {
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;
    track('pageview', pathname);
  }, [pathname]);

  // تتبع أول تحميل
  useEffect(() => {
    track('pageview', window.location.pathname);
    lastTrackedPath.current = window.location.pathname;
  }, []);

  return null;
}
