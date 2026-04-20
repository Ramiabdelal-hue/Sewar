"use client";

import { useLang } from "@/context/LangContext";

const messages: Record<string, string[]> = {
  nl: [
    "🔒 Deze website is volledig beveiligd en bewaakt",
    "⚖️ Elke poging tot inbreuk wordt onmiddellijk juridisch vervolgd",
    "🛡️ Alle inhoud is beschermd door Belgische en Europese auteursrechten",
    "📵 Kopiëren, fotograferen of herpubliceren is strikt verboden en strafbaar",
    "🔐 Overtreders worden zonder waarschuwing aansprakelijk gesteld",
  ],
  fr: [
    "🔒 Ce site est entièrement protégé et surveillé",
    "⚖️ Toute tentative de violation sera immédiatement poursuivie en justice",
    "🛡️ Tout le contenu est protégé par les droits d'auteur belges et européens",
    "📵 La copie, la photographie ou la republication est strictement interdite et punissable",
    "🔐 Les contrevenants seront tenus responsables sans avertissement",
  ],
  ar: [
    "🔒 هذا الموقع محمي ومراقب بالكامل",
    "⚖️ أي محاولة انتهاك ستعرض صاحبها للمساءلة القانونية الفورية",
    "🛡️ جميع المحتويات محمية بموجب قوانين حقوق الملكية الفكرية البلجيكية والأوروبية",
    "📵 النسخ أو التصوير أو إعادة النشر محظور تماماً ويُعدّ جريمة يعاقب عليها القانون",
    "🔐 المخالفون سيُحاسَبون قانونياً دون أي إنذار مسبق",
  ],
  en: [
    "🔒 This website is fully protected and monitored",
    "⚖️ Any attempt to violate will result in immediate legal action",
    "🛡️ All content is protected under Belgian and European intellectual property laws",
    "📵 Copying, photographing or republishing is strictly prohibited and punishable by law",
    "🔐 Violators will be held legally accountable without prior warning",
  ],
};

export default function SecurityBanner() {
  const { lang } = useLang();
  const msgs = messages[lang] || messages.nl;
  const text = msgs.join("   •   ");

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
          key={lang}
          className="whitespace-nowrap text-xs font-bold"
          style={{
            animation: "marquee 45s linear infinite",
            color: "#ffd700",
            textShadow: "0 0 10px rgba(255,215,0,0.5)",
            letterSpacing: "0.03em",
            direction: lang === "ar" ? "rtl" : "ltr",
          }}
        >
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>

      {/* أيقونة ثابتة على اليمين */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center px-3"
        style={{ background: "linear-gradient(90deg, transparent, #0a0a1a)", zIndex: 1 }}
      >
        <span style={{ fontSize: "16px" }}>🔒</span>
      </div>

      {/* أيقونة ثابتة على اليسار */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center px-3"
        style={{ background: "linear-gradient(270deg, transparent, #0a0a1a)", zIndex: 1 }}
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
