'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SCHOOL_NAME = 'Sewar Rijbewijs Online';

export default function Watermark() {
  const [time, setTime] = useState('');
  const pathname = usePathname();

  const isExcluded =
    pathname === '/' || pathname.startsWith('/admin');

  useEffect(() => {
    if (isExcluded) return;

    const update = () => {
      const now = new Date().toLocaleTimeString('nl-BE');
      setTime(now);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isExcluded]);

  if (isExcluded || !time) return null;

  const text = `${SCHOOL_NAME} | ${time}`;

  // عدد الصفوف والأعمدة لتغطية كامل الشاشة
  const cols = 5;
  const rows = 12;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* طبقة SVG بخطوط مائلة جميلة */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="watermark-pattern"
            x="0"
            y="0"
            width="320"
            height="120"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            {/* خط زخرفي فوق النص */}
            <line
              x1="0" y1="30"
              x2="320" y2="30"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="0.5"
            />
            {/* النص الرئيسي */}
            <text
              x="160"
              y="65"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize="13"
              fontWeight="bold"
              fill="rgba(0, 0, 0, 0.28)"
              letterSpacing="1.5"
            >
              {text}
            </text>
            {/* خط زخرفي تحت النص */}
            <line
              x1="0" y1="90"
              x2="320" y2="90"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark-pattern)" />
      </svg>
    </div>
  );
}
