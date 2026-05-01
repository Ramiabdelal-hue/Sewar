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
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignContent: 'space-around',
        zIndex: 9999,
        userSelect: 'none',
        overflow: 'hidden',
        // نوسّع المساحة لتغطي كل الشاشة حتى بعد الـ rotate
        width: '150vw',
        height: '150vh',
        top: '-25vh',
        left: '-25vw',
      }}
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            padding: '16px 8px',
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
