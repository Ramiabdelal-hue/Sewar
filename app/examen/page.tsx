"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaMotorcycle, FaCarSide, FaTruck } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";

export default function ExamenPage() {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const router = useRouter();

  const [isCheckout, setIsCheckout] = useState(false);
  const [globalSelection, setGlobalSelection] = useState<{catId: string, duration: string, catName: string} | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [showLessons, setShowLessons] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("renewPrefillData");
    if (stored) setPrefillData(JSON.parse(stored));
  }, []);

  const categories = [
    { id: "cat-a", catLetter: "A", name: "Rijbewijs A", description: t.motorcycles || "Motorfietsen" },
    { id: "cat-b", catLetter: "B", name: "Rijbewijs B", description: t.cars || "Auto's" },
    { id: "cat-c", catLetter: "C", name: "Rijbewijs C", description: t.trucks || "Vrachtwagens" },
  ];

  const durations = [
    { key: "2w", label: t.twoWeeks || "2 Weken", price: "€ 25" },
    { key: "1m", label: t.oneMonth || "1 Maand", price: "€ 50" },
  ];

  const fetchLessons = async (catLetter: string) => {
    try {
      const res = await fetch(`/api/lessons?category=exam${catLetter}&questionType=Examen`);
      const data = await res.json();
      if (data.success) setAvailableLessons(data.lessons);
    } catch (e) { console.error(e); }
  };

  const handleSelect = (catId: string, durKey: string, catName: string) => {
    setGlobalSelection({ catId, duration: durKey, catName });
  };

  if (isCheckout && globalSelection) {
    return (
      <CheckoutForm
        selectedData={globalSelection}
        onBack={() => { setIsCheckout(false); setGlobalSelection(null); }}
        prefillData={prefillData}
      />
    );
  }

  if (showLessons && userEmail && selectedCategory) {
    return (
      <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Navbar />
        <div className="w-full px-4 py-6">
          <button onClick={() => setShowLessons(false)} className="mb-4 text-[#003399] font-bold hover:underline">
            ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
            {lang === "ar" ? "اختر الدرس" : lang === "nl" ? "KIES EEN LES" : lang === "fr" ? "CHOISISSEZ UNE LEÇON" : "CHOOSE A LESSON"}
          </h1>
          {availableLessons.length === 0 ? (
            <p className="text-gray-500 p-4">{lang === "ar" ? "لا توجد دروس" : "Geen lessen beschikbaar"}</p>
          ) : (
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup><col style={{ width: "75%" }} /><col style={{ width: "25%" }} /></colgroup>
              <thead>
                <tr style={{ backgroundColor: "#3399ff" }}>
                  <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                    {lang === "ar" ? "الدرس" : "LES"}
                  </th>
                  <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                    {lang === "ar" ? "ابدأ" : "START"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {availableLessons.map((lesson, i) => (
                  <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#ddeeff" }}>
                    <td className="px-4 py-3 border border-gray-200 font-bold text-[#003399] text-base">
                      {i + 1}. {lesson.title}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <button
                        onClick={() => router.push(`/examen/test?category=${selectedCategory}&lesson=${encodeURIComponent(lesson.title)}&email=${encodeURIComponent(userEmail)}`)}
                        className="bg-white border-2 border-gray-400 px-6 py-1.5 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                      >
                        {lang === "ar" ? "ابدأ" : lang === "nl" ? "Start" : lang === "fr" ? "Démarrer" : "Start"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {lang === "ar" ? "امتحانات رخصة القيادة" : lang === "nl" ? "THEORIE EXAMEN RIJBEWIJS" : lang === "fr" ? "EXAMEN THÉORIQUE PERMIS" : "THEORY DRIVING LICENSE EXAM"}
        </h1>

        {/* جدول على الشاشات الكبيرة */}
        <div className="hidden sm:block">
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "35%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                  {lang === "ar" ? "الفئة" : lang === "nl" ? "CATEGORIE" : lang === "fr" ? "CATÉGORIE" : "CATEGORY"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {t.twoWeeks || "2 Weken"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {t.oneMonth || "1 Maand"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {lang === "ar" ? "اشترك" : lang === "nl" ? "INSCHRIJVEN" : lang === "fr" ? "S'INSCRIRE" : "SUBSCRIBE"}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#ddeeff" }}>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="font-black text-[#003399] text-base">{cat.name}</div>
                    <div className="text-gray-500 text-sm">{cat.description}</div>
                  </td>
                  {durations.map((dur) => (
                    <td key={dur.key} className="px-4 py-3 border border-gray-200 text-center">
                      <button
                        onClick={() => handleSelect(cat.id, dur.key, cat.name)}
                        className={`px-4 py-1.5 text-sm font-bold border-2 transition-colors w-full ${
                          globalSelection?.catId === cat.id && globalSelection?.duration === dur.key
                            ? "bg-[#3399ff] text-white border-[#3399ff]"
                            : "bg-white border-gray-400 hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff]"
                        }`}
                      >
                        {dur.price}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => { if (globalSelection?.catId === cat.id) setIsCheckout(true); }}
                      disabled={globalSelection?.catId !== cat.id}
                      className={`px-6 py-1.5 text-sm font-bold border-2 transition-colors ${
                        globalSelection?.catId === cat.id
                          ? "bg-white border-gray-400 hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff]"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {lang === "ar" ? "اشترك" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* بطاقات على الموبايل */}
        <div className="sm:hidden flex flex-col gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#ddeeff" }} className="border border-gray-200 p-4 rounded">
              <div className="font-black text-[#003399] text-base mb-1">{cat.name}</div>
              <div className="text-gray-500 text-sm mb-3">{cat.description}</div>
              <div className="flex gap-2 mb-3">
                {durations.map((dur) => (
                  <button
                    key={dur.key}
                    onClick={() => handleSelect(cat.id, dur.key, cat.name)}
                    className={`flex-1 py-2 text-sm font-bold border-2 transition-colors ${
                      globalSelection?.catId === cat.id && globalSelection?.duration === dur.key
                        ? "bg-[#3399ff] text-white border-[#3399ff]"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {dur.label}<br/><span className="font-black">{dur.price}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (globalSelection?.catId === cat.id) setIsCheckout(true); }}
                disabled={globalSelection?.catId !== cat.id}
                className={`w-full py-2.5 text-sm font-bold border-2 transition-colors ${
                  globalSelection?.catId === cat.id
                    ? "bg-[#3399ff] text-white border-[#3399ff]"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
