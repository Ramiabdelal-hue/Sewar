"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";

export default function VideoLessonsPage() {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("renewPrefillData");
    if (stored) setPrefillData(JSON.parse(stored));
  }, []);

  const options = [
    {
      id: "lessons",
      title: t.drivingLessons || "Oefenvideo's",
      description: t.lessonsDesc || "Volledige uitleg van alle verkeersregels met beeld en geluid",
      price: "€49"
    },
    {
      id: "exam",
      title: t.practicalExam || "Gevaarherkenning",
      description: t.examDesc || "Praktijkgerichte video-oefeningen om je voor te bereiden op het examen",
      price: "€39"
    }
  ];

  if (isCheckout && selectedBox) {
    return (
      <CheckoutForm
        selectedData={{ catId: selectedBox, duration: "praktical" }}
        onBack={() => setIsCheckout(false)}
        prefillData={prefillData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {t.prakticalTitle || "PRAKTIJK OEFENINGEN"}
        </h1>

        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#3399ff" }}>
              <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                {lang === "ar" ? "النوع" : lang === "nl" ? "TYPE" : lang === "fr" ? "TYPE" : "TYPE"}
              </th>
              <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                {lang === "ar" ? "السعر" : lang === "nl" ? "PRIJS" : lang === "fr" ? "PRIX" : "PRICE"}
              </th>
              <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                {lang === "ar" ? "اختيار" : lang === "nl" ? "KIES" : lang === "fr" ? "CHOISIR" : "SELECT"}
              </th>
            </tr>
          </thead>
          <tbody>
            {options.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#ddeeff" }}>
                <td className="px-4 py-3 border border-gray-200">
                  <div className="font-black text-[#003399] text-base">{item.title}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                </td>
                <td className="px-4 py-3 border border-gray-200 text-center font-black text-[#003399] text-lg">
                  {item.price}
                </td>
                <td className="px-4 py-3 border border-gray-200 text-center">
                  <button
                    onClick={() => { setSelectedBox(item.id); setIsCheckout(true); }}
                    className="bg-white border-2 border-gray-400 px-6 py-1.5 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                  >
                    {lang === "ar" ? "اشترك" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
