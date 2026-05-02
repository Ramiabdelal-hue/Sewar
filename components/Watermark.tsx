'use client';

import { usePathname } from 'next/navigation';

const SCHOOL_NAME = 'Sewar Rijbewijs';

// الصفحات التي تظهر فيها الـ watermark فقط
const ALLOWED_PATHS = [
  '/theorie/lesson',
  '/gratis/lesson',
  '/gratis/exam',
  '/examen',
  '/praktical/lesson',
  '/praktical/exam',
  '/lessons/view',
  '/lesson',
];

export default function Watermark() {
  const pathname = usePathname();

  const isAllowed = ALLOWED_PATHS.some(p => pathname.startsWith(p));
  if (!isAllowed) return null;

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
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pattern: نص مائل + أيقونة دائرية — مثل Shutterstock */}
          <pattern
            id="wm-pattern"
            x="0"
            y="0"
            width="260"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-28)"
          >
            {/* ── النص الكبير ── */}
            <text
              x="130"
              y="72"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="15"
              fontWeight="700"
              fill="rgba(255,255,255,0.55)"
              letterSpacing="1.2"
            >
              {SCHOOL_NAME}
            </text>

            {/* ── أيقونة دائرية (مثل أيقونة الكاميرا في Shutterstock) ── */}
            {/* دائرة خارجية */}
            <circle
              cx="130"
              cy="118"
              r="11"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />
            {/* حرف S داخل الدائرة */}
            <text
              x="130"
              y="123"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="11"
              fontWeight="900"
              fill="rgba(255,255,255,0.45)"
            >
              S
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>
    </div>
  );
}
