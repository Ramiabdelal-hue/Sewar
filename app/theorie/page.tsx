"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";
import { FaLock } from "react-icons/fa";
import { MotorcycleIcon, CarIcon, TruckIcon } from "@/components/VehicleIcons";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";

export default function TheoriePage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [globalSelection, setGlobalSelection] = useState<{catId: string, duration: string, catName: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Hook دائماً في نفس المكان - قبل أي return
  const translatedTitles = useAutoTranslateList(lessons.map(l => l.title), lang);

  const categories = [
    { id: "A", name: "Rijbewijs A", description: t.motorcycles || "Motorfietsen", icon: <MotorcycleIcon className="w-16 h-10" /> },
    { id: "B", name: "Rijbewijs B", description: t.cars || "Auto's", icon: <CarIcon className="w-16 h-10" /> },
    { id: "C", name: "Rijbewijs C", description: t.trucks || "Vrachtwagens", icon: <TruckIcon className="w-16 h-10" /> },
  ];

  const durations = [
    { key: "2w", label: t.twoWeeks || "2 Weken", price: "€ 25" },
    { key: "1m", label: t.oneMonth || "1 Maand", price: "€ 50" },
  ];

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const category = localStorage.getItem("userCategory");
    if (email && category) {
      setUserEmail(email);
      setUserCategory(category);
      setIsLoggedIn(true);
      checkAndFetch(email, category);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAndFetch = async (email: string, category: string) => {
    try {
      const res = await fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.expired || !data.success) { setIsExpired(true); setLoading(false); return; }

      // التحقق إن الاشتراك من نوع theorie فقط
      const subs = data.subscriptions || [];
      const hasTheorie = subs.some((s: any) => s.subscriptionType === "theorie") || 
                         data.user?.subscriptionType === "theorie";
      
      if (!hasTheorie && subs.length > 0) {
        // ليس لديه اشتراك theorie - أعد توجيهه
        const praktijkLessons = subs.find((s: any) => s.subscriptionType === "praktijk-lessons");
        const praktijkExam = subs.find((s: any) => s.subscriptionType === "praktijk-exam");
        const examen = subs.find((s: any) => s.subscriptionType === "examen");
        
        if (praktijkLessons) {
          window.location.assign(`/praktical/lessons?email=${encodeURIComponent(email)}&exp=${new Date(praktijkLessons.expiryDate).getTime()}`);
        } else if (praktijkExam) {
          window.location.assign(`/praktical/exam?email=${encodeURIComponent(email)}&exp=${new Date(praktijkExam.expiryDate).getTime()}`);
        } else if (examen) {
          window.location.assign(`/examen?email=${encodeURIComponent(email)}&cat=${examen.category}&exp=${new Date(examen.expiryDate).getTime()}`);
        }
        setLoading(false);
        return;
      }

      const lessonsRes = await fetch(`/api/lessons?category=${category}&questionType=Theori`);
      const lessonsData = await lessonsRes.json();
      if (lessonsData.success) setLessons(lessonsData.lessons);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (showCheckout && globalSelection) {
    return <CheckoutForm selectedData={globalSelection} onBack={() => setShowCheckout(false)} />;
  }

  // صفحة الاشتراك
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Navbar />
        <div className="w-full px-4 py-6">
          <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
            {lang === "ar" ? "نظرية رخصة القيادة - اشتراك" : lang === "nl" ? "THEORIE RIJBEWIJS - INSCHRIJVING" : lang === "fr" ? "THÉORIE PERMIS - INSCRIPTION" : "THEORY LICENSE - SUBSCRIPTION"}
          </h1>
          <div className="hidden sm:block">
            <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "35%" }} /><col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} /><col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "#3399ff" }}>
                  <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">{lang === "ar" ? "الفئة" : lang === "nl" ? "CATEGORIE" : lang === "fr" ? "CATÉGORIE" : "CATEGORY"}</th>
                  <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">{t.twoWeeks || "2 Weken"}</th>
                  <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">{t.oneMonth || "1 Maand"}</th>
                  <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">{lang === "ar" ? "اشترك" : lang === "nl" ? "INSCHRIJVEN" : lang === "fr" ? "S'INSCRIRE" : "SUBSCRIBE"}</th>
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
                    {durations.map((dur) => (
                      <td key={dur.key} className="px-4 py-3 border border-gray-200 text-center">
                        <button onClick={() => setGlobalSelection({ catId: cat.id, duration: dur.key, catName: cat.name })}
                          className={`px-4 py-1.5 text-sm font-bold border-2 transition-colors w-full ${globalSelection?.catId === cat.id && globalSelection?.duration === dur.key ? "bg-[#3399ff] text-white border-[#3399ff]" : "bg-white border-gray-400 hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff]"}`}>
                          {dur.price}
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <button onClick={() => { if (globalSelection?.catId === cat.id) setShowCheckout(true); }} disabled={globalSelection?.catId !== cat.id}
                        className={`px-6 py-1.5 text-sm font-bold border-2 transition-colors ${globalSelection?.catId === cat.id ? "bg-white border-gray-400 hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>
                        {lang === "ar" ? "اشترك" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden flex flex-col gap-4">
            {categories.map((cat, i) => (
              <div key={cat.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }} className="border border-gray-200 p-4 rounded">
                <div className="flex items-center gap-3 mb-2">
                  {cat.icon}
                  <div>
                    <div className="font-black text-[#003399] text-base">{cat.name}</div>
                    <div className="text-gray-500 text-sm">{cat.description}</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {durations.map((dur) => (
                    <button key={dur.key} onClick={() => setGlobalSelection({ catId: cat.id, duration: dur.key, catName: cat.name })}
                      className={`flex-1 py-2 text-sm font-bold border-2 transition-colors ${globalSelection?.catId === cat.id && globalSelection?.duration === dur.key ? "bg-[#3399ff] text-white border-[#3399ff]" : "bg-white border-gray-400"}`}>
                      {dur.label}<br /><span className="font-black">{dur.price}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (globalSelection?.catId === cat.id) setShowCheckout(true); }} disabled={globalSelection?.catId !== cat.id}
                  className={`w-full py-2.5 text-sm font-bold border-2 transition-colors ${globalSelection?.catId === cat.id ? "bg-[#3399ff] text-white border-[#3399ff]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {lang === "ar" ? "اشترك الآن" : lang === "nl" ? "Inschrijven" : lang === "fr" ? "S'inscrire" : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex items-center justify-center py-20 px-6 text-center">
          <div className="bg-white border-t-8 border-red-500 shadow-xl p-10 max-w-md">
            <FaLock className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-4">
              {lang === "ar" ? "انتهت صلاحية الاشتراك" : lang === "nl" ? "Abonnement verlopen" : "Abonnement expiré"}
            </h2>
            <button onClick={() => { localStorage.removeItem("userEmail"); localStorage.removeItem("userCategory"); localStorage.removeItem("userExpiry"); setIsLoggedIn(false); setIsExpired(false); }}
              className="bg-[#3399ff] text-white px-8 py-3 font-bold hover:bg-[#2277cc] transition w-full mb-2">
              {lang === "ar" ? "تجديد الاشتراك" : lang === "nl" ? "Vernieuwen" : "Renouveler"}
            </button>
            <button onClick={() => router.push("/")} className="bg-gray-500 text-white px-8 py-3 font-bold hover:bg-gray-600 transition w-full">
              {lang === "ar" ? "الرئيسية" : lang === "nl" ? "Home" : "Accueil"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = lessons.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {lang === "ar" ? `نظرية رخصة القيادة - فئة ${userCategory}` : lang === "nl" ? `THEORIE RIJBEWIJS ${userCategory} OEFENVRAGEN` : lang === "fr" ? `THÉORIE PERMIS ${userCategory}` : `THEORY LICENSE ${userCategory}`}
        </h1>
        <div className="mb-4">
          <input type="text"
            placeholder={lang === "ar" ? "ابحث عن درس..." : lang === "nl" ? "Zoek een les..." : lang === "fr" ? "Rechercher..." : "Search..."}
            className="border border-gray-300 px-3 py-2 text-sm w-full sm:w-72 focus:border-blue-500 focus:outline-none rounded"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-[#3399ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="font-bold text-gray-700">{lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : "No lessons available"}</p>
          </div>
        ) : (
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
            <colgroup><col style={{ width: "75%" }} /><col style={{ width: "25%" }} /></colgroup>
            <thead>
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">{lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LEÇON" : "LESSON"}</th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">{lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson, i) => (
                <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200 font-bold text-[#003399] text-base">
                    {i + 1}. {translatedTitles[lessons.indexOf(lesson)] || lesson.title}
                  </td>
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button onClick={() => router.push(`/theorie/lesson?lessonId=${lesson.id}&category=${userCategory}&email=${userEmail}&lesson=${encodeURIComponent(lesson.title)}`)}
                      className="bg-white border-2 border-gray-400 px-6 py-1.5 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors">
                      {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* زر Examen واحد للفئة */}
          <div className="mt-4">
            <button
              onClick={() => router.push(`/examen?email=${userEmail}&cat=${userCategory}`)}
              className="px-8 py-3 font-black text-sm uppercase border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
            >
              🎯 {lang === "ar" ? "ابدأ امتحان الفئة" : lang === "nl" ? `Examen Categorie ${userCategory}` : lang === "fr" ? `Examen Catégorie ${userCategory}` : `Exam Category ${userCategory}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
