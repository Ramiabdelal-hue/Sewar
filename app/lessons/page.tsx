"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

function LessonsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const cat = searchParams.get("cat");
  const exp = searchParams.get("exp");
  const userEmailFromUrl = searchParams.get("user") || searchParams.get("email");
  const userEmailFromStorage = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const userEmail = userEmailFromUrl || userEmailFromStorage;

  const [isExpired, setIsExpired] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checking, setChecking] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  useEffect(() => {
    if (userEmail) localStorage.setItem("userEmail", userEmail);
    if (cat) localStorage.setItem("userCategory", cat);
    if (exp) localStorage.setItem("userExpiry", exp);

    const checkSubscription = async () => {
      if (!userEmail) { setIsExpired(true); setChecking(false); return; }
      try {
        const res = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await res.json();
        if (data.expired || !data.success) { setIsExpired(true); setPrefillData({ email: userEmail }); }
      } catch (e) { console.error(e); }
      finally { setChecking(false); }
    };
    checkSubscription();
  }, [userEmail, cat, exp]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!cat) { setLoadingLessons(false); return; }
      try {
        const res = await fetch(`/api/lessons?category=${cat.toUpperCase()}`);
        const data = await res.json();
        if (data.success) setLessons(data.lessons);
      } catch (e) { console.error(e); }
      finally { setLoadingLessons(false); }
    };
    fetchLessons();
  }, [cat]);

  const currentCategory = (cat || "B").toUpperCase();

  const getCategoryTitle = () => {
    if (currentCategory === "C") return lang === "ar" ? "فئة الشاحنات C" : lang === "nl" ? "THEORIE RIJBEWIJS C" : lang === "fr" ? "THÉORIE PERMIS C" : "THEORY LICENSE C";
    if (currentCategory === "A") return lang === "ar" ? "فئة الدراجات A" : lang === "nl" ? "THEORIE RIJBEWIJS A" : lang === "fr" ? "THÉORIE PERMIS A" : "THEORY LICENSE A";
    return lang === "ar" ? "فئة السيارات B" : lang === "nl" ? "THEORIE RIJBEWIJS B" : lang === "fr" ? "THÉORIE PERMIS B" : "THEORY LICENSE B";
  };

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (checking || loadingLessons) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-bold text-gray-600">
            {lang === "ar" ? "جاري التحميل..." : lang === "nl" ? "Laden..." : lang === "fr" ? "Chargement..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (renewing) {
    return <CheckoutForm selectedData={{ catId: `cat-${cat?.toLowerCase()}` }} onBack={() => setRenewing(false)} prefillData={prefillData} />;
  }

  if (isExpired || !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md border-t-8 border-red-500">
          <FaLock className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            {lang === "ar" ? "الاشتراك غير متاح" : lang === "nl" ? "Abonnement niet beschikbaar" : lang === "fr" ? "Abonnement non disponible" : "Subscription not available"}
          </h2>
          <p className="text-gray-500 mb-6">
            {!userEmail
              ? (lang === "ar" ? "يرجى تسجيل الدخول مرة أخرى" : "Please login again")
              : (lang === "ar" ? "انتهت صلاحية اشتراكك" : lang === "nl" ? "Uw abonnement is verlopen" : lang === "fr" ? "Votre abonnement a expiré" : "Your subscription has expired")}
          </p>
          <button
            onClick={() => !userEmail ? router.push("/") : setRenewing(true)}
            className="bg-blue-600 text-white px-8 py-3 font-bold hover:bg-blue-700 transition"
          >
            {!userEmail ? (lang === "ar" ? "تسجيل الدخول" : "Login") : (lang === "ar" ? "تجديد الاشتراك" : lang === "nl" ? "Vernieuwen" : lang === "fr" ? "Renouveler" : "Renew")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4">

        {/* عنوان الصفحة */}
        <h1 className="text-lg sm:text-2xl font-black text-[#003399] uppercase border-b-2 border-[#003399] pb-2 mb-4">
          {getCategoryTitle()} {lang === "ar" ? "- الدروس" : lang === "nl" ? "OEFENVRAGEN EN PROEFEXAMEN" : lang === "fr" ? "QUESTIONS ET EXAMEN" : "PRACTICE QUESTIONS AND EXAM"}
        </h1>

        {/* شريط البحث */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === "ar" ? "ابحث عن درس..." : lang === "nl" ? "Zoek een les..." : lang === "fr" ? "Rechercher..." : "Search lesson..."}
            className="border-2 border-gray-300 px-3 py-2 text-sm w-full sm:w-80 focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* جدول الدروس */}
        {filteredLessons.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-300 p-6 text-center">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : lang === "fr" ? "Aucune leçon disponible" : "No lessons available"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#3399ff] text-white">
                <th className="text-left px-3 py-2 font-bold uppercase text-xs sm:text-sm border border-[#2277cc]">
                  {lang === "ar" ? "الدرس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                </th>
                <th className="px-3 py-2 font-bold uppercase text-xs sm:text-sm border border-[#2277cc] w-28 sm:w-36 text-center">
                  {lang === "ar" ? "فتح" : lang === "nl" ? "Openen" : lang === "fr" ? "Ouvrir" : "Open"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson, i) => (
                <tr
                  key={lesson.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#e8f4ff]"}
                >
                  <td className="px-3 py-2 border border-gray-200 font-bold text-[#003399] text-xs sm:text-sm">
                    {i + 1}. {lesson.title}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-center">
                    <button
                      onClick={() => router.push(`/lessons/view?lessonId=${lesson.id}&category=${cat || "B"}&email=${userEmail}`)}
                      className="bg-white border-2 border-gray-400 px-4 py-1 text-xs sm:text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                    >
                      {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* عدد الدروس */}
        <p className="text-xs text-gray-500 mt-3">
          {lang === "ar" ? `إجمالي الدروس: ${filteredLessons.length}` : lang === "nl" ? `Totaal lessen: ${filteredLessons.length}` : lang === "fr" ? `Total leçons: ${filteredLessons.length}` : `Total lessons: ${filteredLessons.length}`}
        </p>
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 font-bold">Loading...</div>}>
      <LessonsContent />
    </Suspense>
  );
}
