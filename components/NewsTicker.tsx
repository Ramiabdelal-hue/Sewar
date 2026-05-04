"use client";

import { useLang } from "@/context/LangContext";

const messages: Record<string, string[]> = {
  nl: [
    "🌐 Sewar Rijbewijs Online — Officiële leerplatform voor rijbewijstheorie in België",
    "👤 Eigenaar: Sewar Rijbewijs Online",
    "💻 Ontworpen & ontwikkeld door: Rami Abdelal",
    "⚠️ Let op: Bij 3 schermafbeeldingspogingen wordt uw abonnement automatisch tijdelijk opgeschort",
    "🔒 Gebruik van uw abonnement op een ander apparaat wordt automatisch geblokkeerd",
    "🛡️ Alle inhoud is auteursrechtelijk beschermd — Kopiëren of verspreiden is verboden",
  ],
  fr: [
    "🌐 Sewar Rijbewijs Online — Plateforme officielle d'apprentissage du code de la route en Belgique",
    "👤 Propriétaire: Sewar Rijbewijs Online",
    "💻 Conçu & développé par: Rami Abdelal",
    "⚠️ Attention: Après 3 tentatives de capture d'écran, votre abonnement sera automatiquement suspendu",
    "🔒 L'utilisation de votre abonnement sur un autre appareil est automatiquement bloquée",
    "🛡️ Tout le contenu est protégé par le droit d'auteur — Copie ou diffusion interdite",
  ],
  ar: [
    "🌐 Sewar Rijbewijs Online — المنصة الرسمية لتعليم نظرية رخصة القيادة في بلجيكا",
    "👤 مالك الموقع: Sewar Rijbewijs Online",
    "💻 تصميم وتطوير: رامي عبد العال",
    "⚠️ تنبيه: عند التقاط 3 لقطات شاشة سيتم إيقاف اشتراكك تلقائياً بشكل مؤقت",
    "🔒 استخدام اشتراكك على جهاز آخر سيتم إغلاقه تلقائياً",
    "🛡️ جميع المحتويات محمية بحقوق الملكية الفكرية — يُمنع النسخ أو النشر",
  ],
  en: [
    "🌐 Sewar Rijbewijs Online — Official driving theory learning platform in Belgium",
    "👤 Owner: Sewar Rijbewijs Online",
    "💻 Designed & developed by: Rami Abdelal",
    "⚠️ Warning: After 3 screenshot attempts, your subscription will be automatically suspended",
    "🔒 Using your subscription on another device will be automatically blocked",
    "🛡️ All content is copyright protected — Copying or sharing is prohibited",
  ],
};

export default function NewsTicker() {
  const { lang } = useLang();
  const items = messages[lang] || messages.nl;
  // نكرر الرسائل 3 مرات لضمان استمرارية الحركة
  const repeated = [...items, ...items, ...items];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a1628, #0d2d5e)",
        borderBottom: "2px solid #f5a623",
        overflow: "hidden",
        height: "32px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="ticker-track">
        {repeated.map((msg, i) => (
          <span key={i} className="ticker-item">
            {msg}
            <span className="ticker-sep">◆</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: ticker-scroll 15s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          padding: 0 8px;
          flex-shrink: 0;
        }
        .ticker-sep {
          color: #f5a623;
          margin: 0 12px;
          font-size: 8px;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
