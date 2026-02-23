"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaPlayCircle, FaLock, FaClock, FaEnvelope } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";

function LessonsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];
  
  const exp = searchParams.get("exp");
  const userEmail = searchParams.get("user") || searchParams.get("email");
  
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checking, setChecking] = useState(true);

  // التحقق من صلاحية الاشتراك
  useEffect(() => {
    // حفظ بيانات المستخدم في localStorage إذا كانت موجودة في URL
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
    if (exp) {
      localStorage.setItem("userExpiry", exp);
    }

    const checkSubscription = async () => {
      if (!userEmail) {
        setIsExpired(true);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (data.expired || !data.success) {
          setIsExpired(true);
          setPrefillData({ email: userEmail });
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [userEmail, exp]);

  useEffect(() => {
    if (exp) {
      const expiryTime = parseInt(exp);
      const calculateTime = () => {
        const now = new Date().getTime();
        const difference = expiryTime - now;

        if (difference <= 0) {
          setIsExpired(true);
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`${days} ${lang === "ar" ? "يوم" : lang === "nl" ? "dagen" : "jours"} ${hours} ${lang === "ar" ? "ساعة" : lang === "nl" ? "uur" : "heures"}`);
          } else {
            setTimeLeft(`${hours} ${lang === "ar" ? "ساعة" : lang === "nl" ? "uur" : "heures"} ${minutes} ${lang === "ar" ? "دقيقة" : lang === "nl" ? "minuten" : "minutes"}`);
          }
        }
      };

      calculateTime();
      const timer = setInterval(calculateTime, 60000);
      return () => clearInterval(timer);
    }
  }, [exp, lang]);

  const videoLessons = [
    { key: "videoLesson1", nl: "Introductie tot verkeersveiligheid" },
    { key: "videoLesson2", nl: "Verkeerstekens en wegmarkeringen" },
    { key: "videoLesson3", nl: "Voorrangsregels op kruispunten" },
    { key: "videoLesson4", nl: "Snelheidslimieten en afstanden" },
    { key: "videoLesson5", nl: "Veilig inhalen en invoegen" },
    { key: "videoLesson6", nl: "Rijden in het donker" },
    { key: "videoLesson7", nl: "Rijden bij slecht weer" },
    { key: "videoLesson8", nl: "Parkeren en keren" },
    { key: "videoLesson9", nl: "Rotondes en complexe kruispunken" },
    { key: "videoLesson10", nl: "Defensief rijden" },
    { key: "videoLesson11", nl: "Milieubewust rijden" },
    { key: "videoLesson12", nl: "Eerste hulp bij ongevallen" }
  ];


  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {lang === "ar" ? "جاري التحقق من الاشتراك..." : lang === "nl" ? "Abonnement controleren..." : "Vérification de l'abonnement..."}
          </p>
        </div>
      </div>
    );
  }

  if (renewing) {
    return (
      <CheckoutForm
        selectedData={{ catId: "lessons" }}
        onBack={() => setRenewing(false)}
        prefillData={prefillData}
      />
    );
  }

  if (isExpired || !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 text-center" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg border-t-8 border-red-500">
          <FaLock className="text-red-500 text-6xl mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            {lang === "ar" ? "الاشتراك غير متاح" : lang === "nl" ? "Abonnement niet beschikbaar" : "Abonnement non disponible"}
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            {isExpired
              ? lang === "ar" ? `عذراً، انتهت صلاحية الاشتراك المرتبط بالبريد: ${userEmail}` : lang === "nl" ? `Sorry, uw abonnement is verlopen voor: ${userEmail}` : `Désolé, votre abonnement a expiré pour: ${userEmail}`
              : lang === "ar" ? "لم يتم العثور على اشتراك فعال" : lang === "nl" ? "Geen actief abonnement gevonden" : "Aucun abonnement actif trouvé"}
          </p>
          <button
            onClick={() => {
              if (userEmail) {
                setPrefillData({ email: userEmail });
              }
              setRenewing(true);
            }}
            className="bg-brandOrange text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-orange-600 transition"
          >
            {lang === "ar" ? "تجديد الاشتراك الآن" : lang === "nl" ? "Abonnement verlengen" : "Renouveler l'abonnement"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <div className="p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button and Language Buttons */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition font-bold text-gray-700 hover:text-brandOrange"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === "ar" ? "العودة للرئيسية" : lang === "nl" ? "Terug naar Home" : "Retour à l'accueil"}
            </button>
          </div>

          <header className="mb-12 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-4 italic uppercase">
              {lang === "ar" ? "فيديوهات تدريبية" : lang === "nl" ? "Oefenvideo's" : "Vidéos d'entraînement"}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-gray-700 text-sm font-bold">
                <FaEnvelope className="text-brandOrange" />
                <span>{lang === "ar" ? "المشترك" : lang === "nl" ? "Abonnee" : "Abonné"}: {userEmail}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl shadow-sm border border-orange-100 text-brandOrange text-sm font-bold">
                <FaClock />
                <span>{lang === "ar" ? "الوقت المتبقي" : lang === "nl" ? "Resterende tijd" : "Temps restant"}: {timeLeft}</span>
              </div>
            </div>
          </header>

          <div className="mb-6">
            <input 
              type="text" 
              placeholder={lang === "ar" ? "ابحث عن درس..." : lang === "nl" ? "Zoek een les..." : "Rechercher une leçon..."} 
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-brandOrange focus:outline-none transition" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoLessons.filter(lesson => t[lesson.key].toLowerCase().includes(searchTerm.toLowerCase())).map((lesson, i) => (
              <div
                key={i}
                onClick={() => router.push(`/lesson?title=${encodeURIComponent(lesson.nl)}&type=praktical`)}
                className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                  <FaPlayCircle className="text-brandOrange text-5xl opacity-80 group-hover:scale-110 transition-all" />
                  <div className="absolute top-4 right-4 bg-brandOrange text-white px-3 py-1 rounded-full text-xs font-bold">
                    {lang === "ar" ? "الدرس" : lang === "nl" ? "Les" : "Leçon"} {i + 1}
                  </div>
                </div>
                <div className="p-6 text-right">
                  <h3 className="font-bold text-gray-800 text-lg">{t[lesson.key]}</h3>
                  <p className="text-gray-400 text-xs mt-2 italic">
                    {lang === "ar" ? "فيديوهات تدريبية عملية" : lang === "nl" ? "Praktische oefenvideo's" : "Vidéos pratiques"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
