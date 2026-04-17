"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import Navbar from "@/components/Navbar";
import CheckoutForm from "@/components/CheckoutForm";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

export default function InfoPage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  // النصوص الأصلية للخطوات
  const stepsTexts = [
    "Registreren", "Account maken & starten",
    "Theorie studeren", "Leer verkeersregels",
    "Theorie-examen", "50 vragen – min. 41 juist",
    "Voorlopig rijbewijs", "M18 of M36 kiezen",
    "Oefenperiode", "Min. 5 maanden oefenen",
    "Praktijkexamen", "Rijtest op de weg",
    "Rijbewijs behalen", "Officieel rijbewijs",
    "Stappen om je rijbewijs te halen",
  ];
  const translatedSteps = useAutoTranslateList(stepsTexts, lang);

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.success) setPrices(d.settings);
    }).catch(() => {});
  }, []);

  const getPrice = (cat: string, dur: string) =>
    prices[`theorie_${cat}_${dur}`] || (dur === "2w" ? "25" : "50");

  const categories = [
    {
      id: "A", color: "#f97316", bg: "from-orange-50 to-amber-50", border: "border-orange-200",
      titleColor: "text-orange-800", dot: "text-orange-500",
      icon: <MotorcycleIcon className="w-16 h-10" />,
      title: lang === "ar" ? "الفئة A - الدراجات النارية" : lang === "nl" ? "Categorie A - Motorfietsen" : "Catégorie A - Motos",
      facts: [
        lang === "ar" ? "الحد الأدنى للعمر: 18 سنة" : lang === "nl" ? "Minimumleeftijd: 18 jaar" : "Âge minimum: 18 ans",
        lang === "ar" ? "للدراجات النارية بجميع الأحجام" : lang === "nl" ? "Voor motorfietsen van alle cilinders" : "Pour motos de toutes cylindrées",
        lang === "ar" ? "يتطلب امتحان نظري وعملي" : lang === "nl" ? "Vereist theoretisch en praktisch examen" : "Nécessite examen théorique et pratique",
      ],
    },
    {
      id: "B", color: "#3b82f6", bg: "from-blue-50 to-indigo-50", border: "border-blue-200",
      titleColor: "text-blue-800", dot: "text-blue-500",
      icon: <CarIcon className="w-16 h-10" />,
      title: lang === "ar" ? "الفئة B - السيارات" : lang === "nl" ? "Categorie B - Auto's" : "Catégorie B - Voitures",
      facts: [
        lang === "ar" ? "الحد الأدنى للعمر: 18 سنة" : lang === "nl" ? "Minimumleeftijd: 18 jaar" : "Âge minimum: 18 ans",
        lang === "ar" ? "للسيارات حتى 3500 كجم" : lang === "nl" ? "Voor auto's tot 3500 kg" : "Pour voitures jusqu'à 3500 kg",
        lang === "ar" ? "حتى 8 مقاعد للركاب" : lang === "nl" ? "Tot 8 passagiersplaatsen" : "Jusqu'à 8 places passagers",
      ],
    },
    {
      id: "C", color: "#22c55e", bg: "from-green-50 to-emerald-50", border: "border-green-200",
      titleColor: "text-green-800", dot: "text-green-500",
      icon: <TruckIcon className="w-16 h-10" />,
      title: lang === "ar" ? "الفئة C - الشاحنات" : lang === "nl" ? "Categorie C - Vrachtwagens" : "Catégorie C - Camions",
      facts: [
        lang === "ar" ? "الحد الأدنى للعمر: 21 سنة" : lang === "nl" ? "Minimumleeftijd: 21 jaar" : "Âge minimum: 21 ans",
        lang === "ar" ? "للشاحنات أكثر من 3500 كجم" : lang === "nl" ? "Voor vrachtwagens boven 3500 kg" : "Pour camions au-dessus de 3500 kg",
        lang === "ar" ? "يتطلب رخصة B أولاً" : lang === "nl" ? "Vereist eerst rijbewijs B" : "Nécessite d'abord permis B",
      ],
    },
  ];

  if (showCheckout && selectedData) {
    return <CheckoutForm selectedData={selectedData} onBack={() => { setShowCheckout(false); setSelectedData(null); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
          </button>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {lang === "ar" ? "معلومات عن رخصة القيادة البلجيكية" : lang === "nl" ? "Informatie om een Belgisch rijbewijs te verkrijgen" : "Informations pour obtenir un permis de conduire belge"}
          </h1>
          <p className="text-gray-600">
            {lang === "ar" ? "كل ما تحتاج معرفته للحصول على رخصة القيادة في بلجيكا" : lang === "nl" ? "Alles wat je moet weten om je rijbewijs in België te halen" : "Tout ce que vous devez savoir pour obtenir votre permis en Belgique"}
          </p>
        </div>

        <div className="space-y-6">

          {/* كروت الفئات مع الأسعار */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              {lang === "ar" ? "فئات رخصة القيادة والأسعار" : lang === "nl" ? "Rijbewijscategorieën & Prijzen" : "Catégories & Prix"}
            </h2>

            <div className="space-y-5">
              {categories.map(cat => (
                <div key={cat.id} className={`bg-gradient-to-r ${cat.bg} rounded-2xl p-6 border-2 ${cat.border}`}>
                  {/* رأس الكرت */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">{cat.icon}</div>
                    <h3 className={`text-xl font-bold ${cat.titleColor}`}>{cat.title}</h3>
                  </div>

                  {/* المعلومات */}
                  <ul className="space-y-1.5 mb-5">
                    {cat.facts.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`${cat.dot} font-bold`}>•</span>
                        <span className="text-gray-700 text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* الأسعار + أزرار الاشتراك */}
                  <div className="border-t border-white/60 pt-4">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                      {lang === "ar" ? "اشتراك Theorie" : lang === "nl" ? "Theorie Abonnement" : "Abonnement Théorie"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "2w", label: t.twoWeeks || "2 Weken" },
                        { key: "1m", label: t.oneMonth || "1 Maand" },
                      ].map(dur => (
                        <button key={dur.key}
                          onClick={() => {
                            setSelectedData({ catId: cat.id, duration: dur.key, catName: `Rijbewijs ${cat.id}` });
                            setShowCheckout(true);
                          }}
                          className="flex flex-col items-center py-3 px-4 rounded-xl font-black transition-all hover:scale-[1.03] active:scale-95 text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`, boxShadow: `0 4px 14px ${cat.color}40` }}>
                          <span className="text-xs opacity-80 mb-0.5">{dur.label}</span>
                          <span className="text-xl">€{getPrice(cat.id, dur.key)}</span>
                          <span className="text-[10px] opacity-70 mt-0.5">
                            {lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Inschrijven" : "S'inscrire"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* خطوات الحصول على الرخصة - الجديدة */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              {lang === "ar" ? "خطوات الحصول على الرخصة" : lang === "nl" ? "Stappen om je rijbewijs te halen" : translatedSteps[14] || "Stappen om je rijbewijs te halen"}
            </h2>
            <div className="space-y-3">
              {[
                { n: 1, icon: "⭐", title: translatedSteps[0] || "Registreren", sub: translatedSteps[1] || "Account maken & starten", color: "#f97316" },
                { n: 2, icon: "⭐", title: translatedSteps[2] || "Theorie studeren", sub: translatedSteps[3] || "Leer verkeersregels", color: "#3b82f6" },
                { n: 3, icon: "⭐", title: translatedSteps[4] || "Theorie-examen", sub: translatedSteps[5] || "50 vragen – min. 41 juist", color: "#8b5cf6" },
                { n: 4, icon: "⭐", title: translatedSteps[6] || "Voorlopig rijbewijs", sub: translatedSteps[7] || "M18 of M36 kiezen", color: "#ec4899" },
                { n: 5, icon: "⭐", title: translatedSteps[8] || "Oefenperiode", sub: translatedSteps[9] || "Min. 5 maanden oefenen", color: "#14b8a6" },
                { n: 6, icon: "⭐", title: translatedSteps[10] || "Praktijkexamen", sub: translatedSteps[11] || "Rijtest op de weg", color: "#f59e0b" },
                { n: 7, icon: "⭐", title: translatedSteps[12] || "Rijbewijs behalen", sub: translatedSteps[13] || "Officieel rijbewijs", color: "#22c55e" },
              ].map((step, i) => (
                <div key={step.n}>
                  {i > 0 && <div className="flex justify-center my-1"><div className="w-0.5 h-4 bg-gray-200"></div></div>}
                  <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: `${step.color}08`, border: `1.5px solid ${step.color}25` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}>
                      {step.n}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👉</span>
                        <p className="font-black text-gray-800 text-sm">{step.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm">👉</span>
                        <p className="text-xs text-gray-500">{step.sub}</p>
                      </div>
                    </div>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
