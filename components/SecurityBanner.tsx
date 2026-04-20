"use client";

const messages = [
  "🔒 هذا الموقع محمي ومراقب بالكامل — أي محاولة انتهاك ستعرض صاحبها للمساءلة القانونية الفورية",
  "⚖️ جميع المحتويات محمية بموجب قوانين حقوق الملكية الفكرية البلجيكية والأوروبية",
  "🛡️ Deze website is volledig beveiligd en bewaakt — elke inbreuk wordt onmiddellijk juridisch vervolgd",
  "⚠️ Ce site est protégé et surveillé — toute violation sera immédiatement poursuivie en justice",
  "🔐 This website is protected and monitored — any violation will result in immediate legal action",
  "📵 النسخ أو التصوير أو إعادة النشر محظور تماماً ويُعدّ جريمة يعاقب عليها القانون",
];

export default function SecurityBanner() {
  const text = messages.join("   •   ");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9990] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b4b 50%, #0a0a1a 100%)",
        borderTop: "1px solid rgba(255,204,0,0.3)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
        height: "36px",
      }}
    >
      {/* خط ذهبي متوهج في الأعلى */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #ffcc00, #ff9900, #ffcc00, transparent)",
          animation: "shimmer 3s linear infinite",
        }}
      />

      {/* النص المتحرك */}
      <div className="flex items-center h-full">
        <div
          className="whitespace-nowrap text-xs font-bold"
          style={{
            animation: "marquee 40s linear infinite",
            color: "#ffd700",
            textShadow: "0 0 10px rgba(255,215,0,0.5)",
            letterSpacing: "0.03em",
          }}
        >
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>

      {/* أيقونة قفل ثابتة على اليمين */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center px-3"
        style={{
          background: "linear-gradient(90deg, transparent, #0a0a1a)",
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: "16px" }}>🔒</span>
      </div>

      {/* أيقونة قفل ثابتة على اليسار */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center px-3"
        style={{
          background: "linear-gradient(270deg, transparent, #0a0a1a)",
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: "16px" }}>⚖️</span>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
