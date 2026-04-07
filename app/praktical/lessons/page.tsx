"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

function LessonsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const exp = searchParams.get("exp");
  const userEmail = searchParams.get("user") || searchParams.get("email");

  const [isExpired, setIsExpired] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (userEmail) localStorage.setItem("userEmail", userEmail);
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
  }, [userEmail, exp]);

  const videoLessons = [
    { key: "videoLesson1" }, { key: "videoLesson2" }, { key: "videoLesson3" },
    { key: "videoLesson4" }, { key: "videoLesson5" }, { key: "videoLesson6" },
    { key: "videoLesson7" }, { key: "videoLesson8" }, { key: "videoLesson9" },
    { key: "videoLesson10" }, { key: "videoLesson11" }, { key: "videoLesson12" }
  ];

  const filtered = videoLessons.filter(l =>
    (t[l.key] || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ترجمة أسماء الدروس تلقائياً
  const translatedTitles = useAutoTranslateList(filtered.map(l => t[l.key] || ""), lang);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (renewing) {
    return <CheckoutForm selectedData={{ catId: "lessons" }} onBack={() => setRenewing(false)} prefillData={prefillData} />;
  }

  if (isExpired || !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md border-t-8 border-red-500">
          <FaLock className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            {lang === "ar" ? "الاشتراك غير متاح" : lang === "nl" ? "Abonnement niet beschikbaar" : "Subscription not available"}
          </h2>
          <button onClick={() => setRenewing(true)} className="bg-blue-600 text-white px-8 py-3 font-bold hover:bg-blue-700 transition">
            {lang === "ar" ? "تجديد الاشتراك" : lang === "nl" ? "Vernieuwen" : "Renew"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {lang === "ar" ? "فيديوهات تدريبية عملية" : lang === "nl" ? "PRAKTIJK OEFENVIDEO'S" : lang === "fr" ? "VIDÉOS PRATIQUES" : "PRACTICAL TRAINING VIDEOS"}
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === "ar" ? "ابحث عن درس..." : lang === "nl" ? "Zoek een les..." : lang === "fr" ? "Rechercher..." : "Search..."}
            className="border border-gray-300 px-3 py-2 text-sm w-full sm:w-72 focus:border-blue-500 focus:outline-none rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "75%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#3399ff" }}>
              <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LEÇON" : "LESSON"}
              </th>
              <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                {lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lesson, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#ddeeff" }}>
                <td className="px-4 py-3 border border-gray-200 font-bold text-[#003399] text-base">
                  {i + 1}. {translatedTitles[i] || t[lesson.key]}
                </td>
                <td className="px-4 py-3 border border-gray-200 text-center">
                  <button
                    onClick={() => router.push(`/lesson?title=${encodeURIComponent(t[lesson.key])}&type=praktical`)}
                    className="bg-white border-2 border-gray-400 px-6 py-1.5 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                  >
                    {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-gray-400 mt-3">
          {lang === "ar" ? `إجمالي: ${filtered.length} درس` : `Total: ${filtered.length} lessons`}
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
