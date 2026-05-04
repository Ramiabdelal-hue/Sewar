"use client";

import { useLang } from "@/context/LangContext";

const messages: Record<string, string[]> = {
  nl: [
    "🌐 Sewar Rijbewijs Online — Officiële leerplatform voor rijbewijstheorie in België",
    "Eigenaar: Sewar Rijbewijs Online",
    "💻 Ontworpen & ontwikkeld door: Rami Abdelal",
    "⚠️ Waarschuwing: Bij 3 of meer schermafbeeldingen wordt uw abonnement automatisch en onmiddellijk opgeschort",
    "⚖️ Juridische gevolgen: Verspreiding van beschermde inhoud leidt tot juridische vervolging op grond van Belgische auteursrechtwetten",
    "🔒 Gebruik van uw abonnement op een ander apparaat wordt automatisch geblokkeerd en gemeld",
    "🛡️ Alle inhoud is auteursrechtelijk beschermd — Kopiëren, delen of verspreiden is ten strengste verboden",
    "📵 Schermopnames en screenshots zijn verboden — Overtreders worden permanent geblokkeerd",
  ],
  fr: [
    "🌐 Sewar Rijbewijs Online — Plateforme officielle d'apprentissage du code de la route en Belgique",
    "Propriétaire: Sewar Rijbewijs Online",
    "💻 Conçu & développé par: Rami Abdelal",
    "⚠️ Avertissement: Après 3 captures d'écran ou plus, votre abonnement sera automatiquement et immédiatement suspendu",
    "⚖️ Conséquences juridiques: La diffusion de contenu protégé entraîne des poursuites judiciaires selon les lois belges sur le droit d'auteur",
    "🔒 L'utilisation de votre abonnement sur un autre appareil est automatiquement bloquée et signalée",
    "🛡️ Tout le contenu est protégé — Copie, partage ou diffusion strictement interdits",
    "📵 Les enregistrements d'écran sont interdits — Les contrevenants seront définitivement bloqués",
  ],
  ar: [
    "🌐 Sewar Rijbewijs Online — المنصة الرسمية لتعليم نظرية رخصة القيادة في بلجيكا",
    "مالك الموقع: Sewar Rijbewijs Online",
    "💻 تصميم وتطوير: رامي عبد العال",
    "⚠️ تحذير: عند التقاط 3 لقطات شاشة أو أكثر سيتم إيقاف اشتراكك تلقائياً وفوراً بدون إنذار",
    "⚖️ العقوبات القانونية: نشر أو توزيع المحتوى المحمي يُعرّضك للملاحقة القضائية بموجب قوانين حقوق الملكية الفكرية البلجيكية",
    "🔒 استخدام اشتراكك على جهاز آخر سيتم إغلاقه تلقائياً والإبلاغ عنه فوراً",
    "🛡️ جميع المحتويات محمية بحقوق الملكية الفكرية — يُمنع منعاً باتاً النسخ أو المشاركة أو النشر",
    "📵 تسجيل الشاشة والتصوير ممنوع — المخالفون سيتم حظرهم نهائياً",
  ],
  en: [
    "🌐 Sewar Rijbewijs Online — Official driving theory learning platform in Belgium",
    "Owner: Sewar Rijbewijs Online",
    "💻 Designed & developed by: Rami Abdelal",
    "⚠️ Warning: After 3 or more screenshot attempts, your subscription will be automatically and immediately suspended",
    "⚖️ Legal consequences: Distributing protected content leads to legal prosecution under Belgian intellectual property laws",
    "🔒 Using your subscription on another device will be automatically blocked and reported",
    "🛡️ All content is copyright protected — Copying, sharing or distributing is strictly forbidden",
    "📵 Screen recording and screenshots are prohibited — Violators will be permanently blocked",
  ],
};

export default function NewsTicker() {
  const { lang } = useLang();
  const items = messages[lang] || messages.nl;
  // نكرر مرتين فقط — الـ CSS يتكفل بالاستمرارية عبر translateX(-50%)
  const repeated = [...items, ...items];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {repeated.map((msg, i) => (
          <span key={i} className="ticker-item">
            {msg}
            <span className="ticker-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
