'use client';

import { useEffect, useState } from 'react';

export default function Watermark() {
  const [text, setText] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'unknown';
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setText(`${email} | ${now}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.1,
        transform: 'rotate(-25deg)',
        display: 'flex',
        flexWrap: 'wrap',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} style={{ margin: 20 }}>{text}</span>
      ))}
    </div>
  );
}
