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
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

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
        if (data.expired || !data.success) { setIsExpired(true); setPrefillData({ email: userEmail }); return; }
        
        // ������ �� �������� �� ��� theorie
        const subs = data.subscriptions || [];
        const hasTheorie = subs.some((s: any) => s.subscriptionType === "theorie") ||
                           data.user?.subscriptionType === "theorie";
        
        if (!hasTheorie && subs.length > 0) {
          const praktijkLessons = subs.find((s: any) => s.subscriptionType === "praktijk-lessons");
          const praktijkExam = subs.find((s: any) => s.subscriptionType === "praktijk-exam");
          if (praktijkLessons) {
            window.location.assign(`/praktical/lessons?email=${encodeURIComponent(userEmail!)}&exp=${new Date(praktijkLessons.expiryDate).getTime()}`);
          } else if (praktijkExam) {
            window.location.assign(`/praktical/exam?email=${encodeURIComponent(userEmail!)}&exp=${new Date(praktijkExam.expiryDate).getTime()}`);
          } else {
            setIsExpired(true);
          }
        }
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
    if (currentCategory === "C") return lang === "ar" ? "����� ���� ������� C" : lang === "nl" ? "THEORIE RIJBEWIJS C OEFENVRAGEN EN PROEFEXAMEN" : lang === "fr" ? "THEORIE PERMIS C QUESTIONS ET EXAMEN" : "THEORY LICENSE C PRACTICE QUESTIONS AND EXAM";
    if (currentCategory === "A") return lang === "ar" ? "����� ���� ������� A" : lang === "nl" ? "THEORIE RIJBEWIJS A OEFENVRAGEN EN PROEFEXAMEN" : lang === "fr" ? "THEORIE PERMIS A QUESTIONS ET EXAMEN" : "THEORY LICENSE A PRACTICE QUESTIONS AND EXAM";
    return lang === "ar" ? "����� ���� ������� B - ����� �������" : lang === "nl" ? "THEORIE RIJBEWIJS B OEFENVRAGEN EN PROEFEXAMEN" : lang === "fr" ? "THEORIE PERMIS B QUESTIONS ET EXAMEN" : "THEORY LICENSE B PRACTICE QUESTIONS AND EXAM";
  };

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ����� ����� ������ ��������
  const translatedTitles = useAutoTranslateList(
    filteredLessons.map(l => l.title),
    lang
  );

  if (checking || loadingLessons) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-bold text-gray-600">
            {lang === "ar" ? "���� �������..." : lang === "nl" ? "Laden..." : lang === "fr" ? "Chargement..." : "Loading..."}
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
            {lang === "ar" ? "�������� ��� ����" : lang === "nl" ? "Abonnement niet beschikbaar" : lang === "fr" ? "Abonnement non disponible" : "Subscription not available"}
          </h2>
          <p className="text-gray-500 mb-6">
            {!userEmail
              ? (lang === "ar" ? "���� ����� ������ ��� ����" : "Please login again")
              : (lang === "ar" ? "����� ������ �������" : lang === "nl" ? "Uw abonnement is verlopen" : lang === "fr" ? "Votre abonnement a expir�" : "Your subscription has expired")}
          </p>
          <button
            onClick={() => !userEmail ? router.push("/") : setRenewing(true)}
            className="bg-blue-600 text-white px-8 py-3 font-bold hover:bg-blue-700 transition"
          >
            {!userEmail ? (lang === "ar" ? "����� ������" : "Login") : (lang === "ar" ? "����� ��������" : lang === "nl" ? "Vernieuwen" : lang === "fr" ? "Renouveler" : "Renew")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <div className="w-full px-4 py-6">

        {/* ����� ������ - ���� ���� �� �� ���� */}
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {getCategoryTitle()}
        </h1>

        {/* ���� ����� */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === "ar" ? "���� �� ���..." : lang === "nl" ? "Zoek een les..." : lang === "fr" ? "Rechercher..." : "Search lesson..."}
            className="border border-gray-300 px-3 py-2 text-sm w-full sm:w-72 focus:border-blue-500 focus:outline-none rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ���� ������ - ��� ���� */}
        {filteredLessons.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "�� ���� ���� �����" : lang === "nl" ? "Geen lessen beschikbaar" : lang === "fr" ? "Aucune le�on disponible" : "No lessons available"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "75%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                  {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LECON" : "LESSON"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson, i) => (
                <tr key={lesson.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                  <td className="px-4 py-3 border border-gray-200 font-bold text-[#003399] text-base">
                    {i + 1}. {translatedTitles[i] || lesson.title}
                  </td>
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => router.push(`/lessons/view?lessonId=${lesson.id}&category=${cat || "B"}&email=${userEmail}`)}
                      className="bg-white border-2 border-gray-400 px-4 py-1 text-sm font-bold hover:bg-[#3399ff] hover:text-white hover:border-[#3399ff] transition-colors"
                    >
                      {lang === "ar" ? "درس" : lang === "nl" ? "Les" : lang === "fr" ? "Leçon" : "Lesson"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* زر Examen واحد لكل الفئة */}
          <div className="mt-4">
            <button
              onClick={() => router.push(`/examen?email=${userEmail}&cat=${cat || "B"}`)}
              className="px-8 py-3 font-black text-sm uppercase border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
            >
              🎯 {lang === "ar" ? "ابدأ امتحان الفئة" : lang === "nl" ? `Examen Categorie ${(cat || "B").toUpperCase()}` : lang === "fr" ? `Examen Catégorie ${(cat || "B").toUpperCase()}` : `Exam Category ${(cat || "B").toUpperCase()}`}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          {lang === "ar" ? `������: ${filteredLessons.length} ���` : lang === "nl" ? `Totaal: ${filteredLessons.length} lessen` : lang === "fr" ? `Total: ${filteredLessons.length} le�ons` : `Total: ${filteredLessons.length} lessons`}
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
