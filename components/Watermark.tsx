'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const EXCLUDED_PATHS = ['/', '/admin'];
const SCHOOL_NAME = 'Sewar Rijbewijs Online';

export default function Watermark() {
  const [text, setText] = useState('');
  const pathname = usePathname();

  const isExcluded =
    pathname === '/' || pathname.startsWith('/admin');

  useEffect(() => {
    if (isExcluded) return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('nl-BE');
      setText(`${SCHOOL_NAME} | ${now}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isExcluded]);

  if (isExcluded || !text) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.08,
        transform: 'rotate(-25deg)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        zIndex: 9999,
        userSelect: 'none',
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} style={{ margin: '18px 24px', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {text}
        </span>
      ))}
    </div>
  );
}
