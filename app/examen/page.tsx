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
  const [examBatches, setExamBatches] = useState<{lessonId: number; lessonTitle: string; batches: number; totalQuestions: number}[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("renewPrefillData");
    if (stored) setPrefillData(JSON.parse(stored));

    // التحقق من اشتراك examen موجود في localStorage فقط
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
              setUserEmail(email);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const categories = [
    { id: "cat-a", catLetter: "A", name: "Rijbewijs A", description: t.motorcycles || "Motorfietsen", icon: <MotorcycleIcon className="w-16 h-10" /> },
    { id: "cat-b", catLetter: "B", name: "Rijbewijs B", description: t.cars || "Auto's", icon: <CarIcon className="w-16 h-10" /> },
    { id: "cat-c", catLetter: "C", name: "Rijbewijs C", description: t.trucks || "Vrachtwagens", icon: <TruckIcon className="w-16 h-10" /> },
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
      const res = await fetch(`/api/lessons?category=${catLetter}`);
      const data = await res.json();
      if (data.success) setAvailableLessons(data.lessons);
    } catch (e) { console.error(e); }
  };

  // جلب عدد الأسئلة لكل درس وحساب عدد الامتحانات - بشكل متوازٍ للسرعة
  const fetchExamBatches = async (catLetter: string) => {
    // تحقق من الـ cache أولاً
    const cacheKey = `examBatches_${catLetter}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setExamBatches(JSON.parse(cached));
        return;
      } catch {}
    }

    setLoadingBatches(true);
    try {
      const res = await fetch(`/api/lessons?category=${catLetter}`);
      const data = await res.json();
      if (!data.success) return;

      // جلب كل الأسئلة بشكل متوازٍ (Promise.all بدل loop)
      const counts = await Promise.all(
        data.lessons.map(async (lesson: any) => {
          try {
            const qRes = await fetch(`/api/exam-questions?lessonId=${lesson.id}&category=${catLetter}`);
            const qData = await qRes.json();
            return {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              count: qData.success ? (qData.questions?.length || 0) : 0,
            };
          } catch {
            return { lessonId: lesson.id, lessonTitle: lesson.title, count: 0 };
          }
        })
      );

      const results = counts
        .filter(item => item.count > 0)
        .map(item => ({
          lessonId: item.lessonId,
          lessonTitle: item.lessonTitle,
          batches: Math.ceil(item.count / 50),
          totalQuestions: item.count,
        }));

      setExamBatches(results);
      // حفظ في cache لـ 5 دقائق
      sessionStorage.setItem(cacheKey, JSON.stringify(results));
    } catch (e) { console.error(e); }
    finally { setLoadingBatches(false); }
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
      <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-2xl font-black uppercase mb-2" style={{ color: "#7c3aed" }}>
              {lang === "ar" ? `امتحان الفئة ${selectedCategory}` : lang === "nl" ? `Examen Categorie ${selectedCategory}` : lang === "fr" ? `Examen Catégorie ${selectedCategory}` : `Exam Category ${selectedCategory}`}
            </h1>
            <p className="text-gray-500 text-sm">
              {lang === "ar" ? "اختر الامتحان" : lang === "nl" ? "Kies een examen" : lang === "fr" ? "Choisir un examen" : "Choose an exam"}
            </p>
          </div>

          {loadingBatches ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : examBatches.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-bold">{lang === "ar" ? "لا توجد أسئلة" : "Geen vragen beschikbaar"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examBatches.map((item) => (
                <div key={item.lessonId} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  {/* عنوان الدرس */}
                  <div className="px-5 py-4 flex items-center gap-3" style={{background:"linear-gradient(135deg,#003399,#0055cc)"}}>
                    <span className="text-2xl">📚</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm truncate">{item.lessonTitle}</p>
                      <p className="text-white/60 text-xs mt-0.5">{item.totalQuestions} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}</p>
                    </div>
                  </div>
                  {/* أزرار الامتحانات */}
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: item.batches }, (_, i) => {
                      const from = i * 50;
                      const count = Math.min(50, item.totalQuestions - from);
                      return (
                        <button
                          key={i}
                          onClick={() => router.push(
                            `/examen/test?category=${selectedCategory}&lesson=${encodeURIComponent(item.lessonTitle)}&email=${encodeURIComponent(userEmail)}&lessonId=${item.lessonId}&offset=${from}&limit=${count}`
                          )}
                          className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-black transition-all active:scale-95 hover:opacity-90"
                          style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"2px solid #93c5fd", color:"#1d4ed8"}}
                        >
                          <span className="text-2xl">🎯</span>
                          <span className="text-sm">{lang === "ar" ? `امتحان ${i + 1}` : lang === "nl" ? `Examen ${i + 1}` : lang === "fr" ? `Examen ${i + 1}` : `Exam ${i + 1}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black uppercase border-b-4 pb-3 mb-5" style={{ color: "#7c3aed", borderColor: "#7c3aed" }}>
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
                        fetchExamBatches(cat.catLetter);
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
                    fetchExamBatches(cat.catLetter);
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
