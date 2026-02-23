"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { FaPlayCircle, FaEye } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import CheckoutForm from "@/components/CheckoutForm";

export default function VideoLessonsPage() {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("renewPrefillData");
    if (stored) {
      setPrefillData(JSON.parse(stored));
    }
  }, []);

  const options = [
    {
      id: "lessons",
      title: t.drivingLessons || "Oefenvideo's",
      description: t.lessonsDesc || "Volledige uitleg van alle verkeersregels met beeld en geluid",
      icon: <FaPlayCircle className="text-4xl text-brandOrange" />,
      price: "€49"
    },
    {
      id: "exam",
      title: t.practicalExam || "Gevaarherkenning",
      description: t.examDesc || "Praktijkgerichte video-oefeningen om je voor te bereiden op het examen",
      icon: <FaEye className="text-4xl text-brandOrange" />,
      price: "€39"
    }
  ];

  const handleConfirm = () => {
    if (selectedBox) {
      setIsCheckout(true);
    }
  };

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
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col justify-center items-center px-4 md:px-6 py-12">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t.prakticalTitle || "Gevaarherkenning Oefeningen"}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
            {t.prakticalSubtitle || "Kies de praktijkopleiding waarmee u vandaag wilt beginnen"}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl w-full mx-auto">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedBox(item.id)}
              className={`group bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center text-center gap-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-2xl relative overflow-hidden ${
                selectedBox === item.id 
                  ? "border-green-500 scale-105 ring-4 ring-green-100" 
                  : "border-gray-100 hover:border-green-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className={`relative p-6 rounded-2xl transition-all duration-300 ${
                selectedBox === item.id 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg" 
                  : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100"
              }`}>
                <div className={selectedBox === item.id ? "text-white text-5xl" : "text-green-600 text-5xl"}>
                  {item.icon}
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-black text-gray-800 mb-3">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="relative z-10 mt-2">
                <div className="inline-flex items-baseline gap-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                  <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{item.price}</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedBox === item.id) {
                    handleConfirm();
                  }
                }}
                disabled={selectedBox !== item.id}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 relative z-10 ${
                  selectedBox === item.id 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedBox === item.id ? (t.confirm || "Bevestigen") : (t.select || "Selecteer")}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}