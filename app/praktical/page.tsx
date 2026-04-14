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

    // إذا كان مشتركاً في praktijk-lessons، وجهه مباشرة
    const email = localStorage.getItem("userEmail");
    if (email) {
      fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.subscriptions) {
            const praktijkLessons = data.subscriptions.find((s: any) => s.subscriptionType === "praktijk-lessons");
            const praktijkExam = data.subscriptions.find((s: any) => s.subscriptionType === "praktijk-exam");
            if (praktijkLessons) {
              window.location.assign(`/praktical/lessons?email=${encodeURIComponent(email)}&exp=${new Date(praktijkLessons.expiryDate).getTime()}`);
            } else if (praktijkExam) {
              window.location.assign(`/praktical/exam?email=${encodeURIComponent(email)}&exp=${new Date(praktijkExam.expiryDate).getTime()}`);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const [praktijkPrices, setPraktijkPrices] = useState({ training: "49", hazard: "39" });

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.success) setPraktijkPrices({ training: d.settings.praktijk_training || "49", hazard: d.settings.praktijk_hazard || "39" });
    }).catch(() => {});
  }, []);

  const options = [
    {
      id: "lessons",
      title: t.drivingLessons || "Oefenvideo's",
      description: t.lessonsDesc || "Volledige uitleg van alle verkeersregels met beeld en geluid",
      price: `€${praktijkPrices.training}`
    },
    {
      id: "exam",
      title: t.practicalExam || "Gevaarherkenning",
      description: t.examDesc || "Praktijkgerichte video-oefeningen om je voor te bereiden op het examen",
      price: `€${praktijkPrices.hazard}`
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

        {/* جدول على الشاشات الكبيرة، بطاقات على الموبايل */}
        <div className="hidden sm:block">
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
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
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
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

        {/* بطاقات على الموبايل */}
        <div className="sm:hidden flex flex-col gap-3">
          {options.map((item, i) => (
            <div key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }} className="border border-gray-200 p-4 rounded">
              <div className="font-black text-[#003399] text-base mb-1">{item.title}</div>
              <div className="text-gray-500 text-sm mb-3">{item.description}</div>
              <div className="flex items-center justify-between">
                <span className="font-black text-[#003399] text-xl">{item.price}</span>
                <button
                  onClick={() => { setSelectedBox(item.id); setIsCheckout(true); }}
                  className="bg-[#3399ff] text-white border-2 border-[#3399ff] px-5 py-2 text-sm font-bold"
                >
                  {lang === "ar" ? "اشترك" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
