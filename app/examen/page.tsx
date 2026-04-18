"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaLock } from "react-icons/fa";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

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

    // قراءة URL params (بعد الاشتراك مباشرة)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const catParam = params.get("cat");
      if (emailParam && catParam) {
        setUserEmail(emailParam);
        setSelectedCategory(catParam);
        fetchLessons(catParam);
        setShowLessons(true);
        return;
      }
    }

    // التحقق من اشتراك examen موجود في localStorage
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
            const examenSub = data.subscriptions.find((s: any) => s.subscriptionType === "examen");
            if (examenSub) {
              const cat = examenSub.category || "B";
              setUserEmail(email);
              setSelectedCategory(cat);
              fetchLessons(cat);
              setShowLessons(true);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const categories = [
    { id: "cat-a", catLetter: "A", name: "Rijbewijs A", description: t.motorcycles || "Motorfietsen", icon: <MotorcycleIcon className="w-16 h-10" /> },
    { id: "cat-b", catLetter: "B", name: "Rijbewijs B", description: t.cars || "Auto's", icon: <CarIcon className="w-16 h-10" /> },
    // { id: "cat-c", catLetter: "C", name: "Rijbewijs C", description: t.trucks || "Vrachtwagens", icon: <TruckIcon className="w-16 h-10" /> }, // temp: hidden
  ];

  const [allExamPrices, setAllExamPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.success) setAllExamPrices(d.settings);
    }).catch(() => {});
  }, []);

  const getExamDurations = (catLetter: string) => [
    { key: "2w", label: t.twoWeeks || "2 Weken", price: `€ ${allExamPrices[`examen_${catLetter}_2w`] || "25"}` },
    { key: "1m", label: t.oneMonth || "1 Maand", price: `€ ${allExamPrices[`examen_${catLetter}_1m`] || "50"}` },
  ];

  const fetchLessons = async (catLetter: string) => {
    try {
      // جلب كل دروس الفئة بدون فلتر questionType
      const res = await fetch(`/api/lessons?category=${catLetter}`);
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
            <p className="text-gray-500 p-4">{lang === "ar" ? "لا توجد دروس" : lang === "nl" ? "Geen lessen beschikbaar" : lang === "fr" ? "Aucune leçon disponible" : "No lessons available"}</p>
          ) : (
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup><col style={{ width: "75%" }} /><col style={{ width: "25%" }} /></colgroup>
              <thead>
                <tr style={{ backgroundColor: "#3399ff" }}>
                  <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                    {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LEÇON" : "LESSON"}
                  </th>
                  <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                    {lang === "ar" ? "ابدأ" : lang === "nl" ? "START" : lang === "fr" ? "DÉMARRER" : "START"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {availableLessons.map((lesson, i) => (
                  <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                    <td className="px-4 py-3 border border-gray-200 font-bold text-[#003399] text-base">
                      {i + 1}. {lesson.title}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <button
                        onClick={() => router.push(`/examen/test?category=${selectedCategory}&lesson=${encodeURIComponent(lesson.title)}&email=${encodeURIComponent(userEmail)}&lessonId=${lesson.id}`)}
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
              <col style={{ width: "45%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                  {lang === "ar" ? "الفئة" : lang === "nl" ? "CATEGORIE" : lang === "fr" ? "CATÉGORIE" : "CATEGORY"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  GRATIS
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  INSCHRIJVEN
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{cat.icon}</div>
                      <div>
                        <div className="font-black text-[#003399] text-base">{cat.name}</div>
                        <div className="text-gray-500 text-sm">{cat.description}</div>
                      </div>
                    </div>
                  </td>
                  {/* زر Gratis - يفتح الامتحان مباشرة */}
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => {
                        const email = localStorage.getItem("userEmail") || "";
                        setUserEmail(email || "guest");
                        setSelectedCategory(cat.catLetter);
                        fetchLessons(cat.catLetter);
                        setShowLessons(true);
                      }}
                      className="px-4 py-1.5 text-sm font-bold border-2 w-full bg-green-500 text-white border-green-500 hover:bg-green-600 transition-colors"
                    >
                      Gratis
                    </button>
                  </td>
                  {/* زر INSCHRIJVEN - زرين للمدتين */}
                  <td className="px-3 py-3 border border-gray-200 text-center">
                    <div className="flex gap-1.5">
                      {getExamDurations(cat.catLetter).map((dur) => (
                        <button key={dur.key}
                          onClick={() => { handleSelect(cat.id, dur.key, cat.name); setIsCheckout(true); }}
                          className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 border-2"
                          style={dur.key === "2w"
                            ? { background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderColor: "#93c5fd", color: "#1d4ed8" }
                            : { background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderColor: "#f59e0b", color: "#92400e" }
                          }
                        >
                          <span className="text-base">{dur.key === "2w" ? "📅" : "🗓️"}</span>
                          <span className="text-[10px] font-black uppercase">{dur.label}</span>
                          <span className="text-sm font-black">{dur.price}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* بطاقات على الموبايل */}
        <div className="sm:hidden flex flex-col gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }} className="border border-gray-200 p-4 rounded">
              <div className="flex items-center gap-3 mb-3">
                {cat.icon}
                <div>
                  <div className="font-black text-[#003399] text-base">{cat.name}</div>
                  <div className="text-gray-500 text-sm">{cat.description}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const email = localStorage.getItem("userEmail") || "";
                    setUserEmail(email || "guest");
                    setSelectedCategory(cat.catLetter);
                    fetchLessons(cat.catLetter);
                    setShowLessons(true);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold border-2 bg-green-500 text-white border-green-500"
                >
                  Gratis
                </button>
                <div className="flex-1 flex gap-1.5">
                  {getExamDurations(cat.catLetter).map((dur) => (
                    <button key={dur.key}
                      onClick={() => { handleSelect(cat.id, dur.key, cat.name); setIsCheckout(true); }}
                      className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg font-bold transition-all active:scale-95 border-2"
                      style={dur.key === "2w"
                        ? { background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderColor: "#93c5fd", color: "#1d4ed8" }
                        : { background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderColor: "#f59e0b", color: "#92400e" }
                      }
                    >
                      <span className="text-sm">{dur.key === "2w" ? "📅" : "🗓️"}</span>
                      <span className="text-[10px] font-black">{dur.label}</span>
                      <span className="text-xs font-black">{dur.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
