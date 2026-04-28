"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

const EXAM_CHUNK = 50;

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

  // popup الامتحانات
  const [examPopup, setExamPopup] = useState<{
    lessonId: number;
    lessonTitle: string;
    groups: { label: string; offset: number; count: number }[];
  } | null>(null);
  const [loadingExam, setLoadingExam] = useState<number | null>(null);

  useEffect(() => {
    if (userEmail) localStorage.setItem("userEmail", userEmail);
    if (cat) localStorage.setItem("userCategory", cat);
    if (exp) localStorage.setItem("userExpiry", exp);

    const checkSubscription = async () => {
      if (!userEmail) { setIsExpired(true); setChecking(false); return; }
      try {
        const fetchPromise = fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        if (!res) { setChecking(false); return; }
        let data: any = {};
        try { data = await res.json(); } catch {}
        if (data.expired || !data.success) { setIsExpired(true); setPrefillData({ email: userEmail }); setChecking(false); return; }

        const subs = data.subscriptions || [];
        const hasTheorie = subs.some((s: any) => s.subscriptionType === "theorie") ||
                           data.user?.subscriptionType === "theorie";

        if (!hasTheorie && subs.length > 0) {
          const praktijkLessons = subs.find((s: any) => s.subscriptionType === "praktijk-lessons");
          const praktijkExam = subs.find((s: any) => s.subscriptionType === "praktijk-exam");
          if (praktijkLessons) {
            router.push(`/praktical/lessons?email=${encodeURIComponent(userEmail!)}&exp=${new Date(praktijkLessons.expiryDate).getTime()}`);
          } else if (praktijkExam) {
            router.push(`/praktical/exam?email=${encodeURIComponent(userEmail!)}&exp=${new Date(praktijkExam.expiryDate).getTime()}`);
          } else {
            setIsExpired(true);
          }
        }
      } catch (e) { 
        console.error(e);
        // عند خطأ في الشبكة نعرض الدروس بدل إخفائها
      }
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
    if (currentCategory === "C") return lang === "ar" ? "نظرية رخصة القيادة C" : lang === "nl" ? "THEORIE RIJBEWIJS C OEFENVRAGEN EN PROEFEXAM" : lang === "fr" ? "THEORIE PERMIS C QUESTIONS ET EXAM" : "THEORY LICENSE C PRACTICE QUESTIONS AND EXAM";
    if (currentCategory === "A") return lang === "ar" ? "نظرية رخصة القيادة A" : lang === "nl" ? "THEORIE RIJBEWIJS A OEFENVRAGEN EN PROEFEXAM" : lang === "fr" ? "THEORIE PERMIS A QUESTIONS ET EXAM" : "THEORY LICENSE A PRACTICE QUESTIONS AND EXAM";
    return lang === "ar" ? "نظرية رخصة القيادة B" : lang === "nl" ? "THEORIE RIJBEWIJS B OEFENVRAGEN EN PROEFEXAM" : lang === "fr" ? "THEORIE PERMIS B QUESTIONS ET EXAM" : "THEORY LICENSE B PRACTICE QUESTIONS AND EXAM";
  };

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translatedTitles = useAutoTranslateList(filteredLessons.map(l => l.title), lang);

  // فتح popup الامتحانات
  const handleExamClick = async (lesson: any) => {
    setLoadingExam(lesson.id);
    try {
      const res = await fetch(`/api/exam-questions?lessonId=${lesson.id}&category=${cat || "B"}`);
      const data = await res.json();
      const total = data.questions?.length || 0;
      if (total === 0) {
        alert(lang === "ar" ? "لا توجد أسئلة لهذا الدرس" : lang === "nl" ? "Geen vragen voor deze les" : lang === "fr" ? "Pas de questions pour cette leçon" : "No questions for this lesson");
        return;
      }
      const groups: { label: string; offset: number; count: number }[] = [];
      for (let i = 0; i < total; i += EXAM_CHUNK) {
        const end = Math.min(i + EXAM_CHUNK, total);
        groups.push({
          label: total <= EXAM_CHUNK ? "EXAM" : `EXAM ${Math.floor(i / EXAM_CHUNK) + 1}`,
          offset: i,
          count: end - i,
        });
      }
      setExamPopup({ lessonId: lesson.id, lessonTitle: lesson.title, groups });
    } catch {
      alert("Error loading exam questions");
    } finally {
      setLoadingExam(null);
    }
  };

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

      <div className="w-full px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-5">
          {getCategoryTitle()}
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === "ar" ? "ابحث عن درس..." : lang === "nl" ? "Zoek een les..." : lang === "fr" ? "Rechercher..." : "Search lesson..."}
            className="border border-gray-300 px-3 py-2 text-sm w-full sm:w-72 focus:border-blue-500 focus:outline-none rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredLessons.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : lang === "fr" ? "Aucune leçon disponible" : "No lessons available"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse lessons-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "60%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#3399ff" }}>
                <th className="text-left px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc]">
                  {lang === "ar" ? "الدرس" : lang === "nl" ? "LES" : lang === "fr" ? "LECON" : "LESSON"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  {lang === "ar" ? "فتح" : lang === "nl" ? "OPENEN" : lang === "fr" ? "OUVRIR" : "OPEN"}
                </th>
                <th className="px-4 py-3 font-black uppercase text-sm text-white border border-[#2277cc] text-center">
                  EXAM
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
                  <td className="px-4 py-3 border border-gray-200 text-center">
                    <button
                      onClick={() => handleExamClick(lesson)}
                      disabled={loadingExam === lesson.id}
                      className="bg-white border-2 border-orange-400 px-4 py-1 text-sm font-bold text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors disabled:opacity-50"
                    >
                      {loadingExam === lesson.id ? "..." : "EXAM"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="text-xs text-gray-400 mt-3">
          {lang === "ar" ? `المجموع: ${filteredLessons.length} درس` : lang === "nl" ? `Totaal: ${filteredLessons.length} lessen` : lang === "fr" ? `Total: ${filteredLessons.length} leçons` : `Total: ${filteredLessons.length} lessons`}
        </p>
      </div>
      <Footer />

      {/* Popup الامتحانات */}
      {examPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">EXAM</p>
                <h2 className="text-white font-black text-base leading-tight">{examPopup.lessonTitle}</h2>
              </div>
              <button onClick={() => setExamPopup(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                ✕
              </button>
            </div>

            {/* أزرار الامتحانات */}
            <div className="p-5 space-y-3">
              {examPopup.groups.length === 1 ? (
                <p className="text-center text-sm text-gray-500 mb-2">
                  {examPopup.groups[0].count} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}
                </p>
              ) : (
                <p className="text-center text-xs text-gray-400 mb-1">
                  {lang === "ar" ? "اختر الامتحان" : lang === "nl" ? "Kies een examen" : lang === "fr" ? "Choisissez un examen" : "Choose an exam"}
                </p>
              )}

              {examPopup.groups.map((g, idx) => (
                <button key={idx}
                  onClick={() => {
                    setExamPopup(null);
                    router.push(`/examen/test?category=${cat || "B"}&email=${userEmail}&lessonId=${examPopup.lessonId}&lesson=${encodeURIComponent(examPopup.lessonTitle)}&offset=${g.offset}&limit=${EXAM_CHUNK}`);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "2px solid #fed7aa" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-orange-800 text-sm">{g.label}</p>
                      <p className="text-xs text-orange-500 mt-0.5">
                        {g.count} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"}
                        {" · "}{lang === "ar" ? `من ${g.offset + 1} إلى ${g.offset + g.count}` : `${g.offset + 1}–${g.offset + g.count}`}
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
