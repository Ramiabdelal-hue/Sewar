'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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
      aria-hidden="true"
      style={{
        position: 'fixed',
        // نوسّع المساحة بكثير لتغطية كل الشاشة بعد الـ rotate
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
        transform: 'rotate(-25deg)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        overflow: 'hidden',
        opacity: 0.08,
      }}
    >
      {Array.from({ length: 200 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            padding: '18px 20px',
            color: '#000',
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
