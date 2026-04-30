'use client';

import { useEffect } from 'react';

export default function ActivityTracker() {
  useEffect(() => {
    function getEmail() {
      try { return localStorage.getItem('userEmail'); } catch { return null; }
    }

    function track(eventType: string) {
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: getEmail(),
          eventType,
          page: window.location.pathname,
        }),
      });
    }

    track('pageview');

    const onPop = () => track('pageview');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return null;
}
