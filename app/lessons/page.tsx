"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaPlayCircle, FaLock, FaClock, FaEnvelope } from "react-icons/fa";
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
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  
  const cat = searchParams.get("cat");
  const exp = searchParams.get("exp");
  const userEmailFromUrl = searchParams.get("user") || searchParams.get("email");
  const userEmailFromStorage = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null;
  const userEmail = userEmailFromUrl || userEmailFromStorage;
  
  console.log("📋 URL Parameters:", { 
    cat, 
    exp, 
    user: searchParams.get("user"), 
    email: searchParams.get("email"),
    userEmailFromUrl,
    userEmailFromStorage,
    finalUserEmail: userEmail 
  });
  
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checking, setChecking] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  // التحقق من صلاحية الاشتراك عند تحميل الصفحة
  useEffect(() => {
    // حفظ بيانات المستخدم في localStorage إذا كانت موجودة في URL
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
    if (cat) {
      localStorage.setItem("userCategory", cat);
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
  }, [userEmail, cat, exp]);

  // جلب الدروس من قاعدة البيانات بناءً على الفئة
  useEffect(() => {
    const fetchLessons = async () => {
      if (!cat) {
        console.log("⚠️ No category specified in URL");
        setLoadingLessons(false);
        return;
      }

      const categoryUpper = cat.toUpperCase();
      console.log("🔍 Fetching lessons for category:", categoryUpper, "(from URL param:", cat, ")");

      try {
        const response = await fetch(`/api/lessons?category=${categoryUpper}`);
        console.log("📡 Response status:", response.status);
        
        const data = await response.json();
        console.log("📦 Response data:", data);

        if (data.success) {
          setLessons(data.lessons);
          console.log(`✅ Loaded ${data.lessons.length} lessons for category ${categoryUpper}`);
        } else {
          console.error("❌ Failed to fetch lessons:", data.message);
          console.error("❌ Full error:", data.error);
        }
      } catch (error) {
        console.error("❌ Error fetching lessons:", error);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [cat]);

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

  let title;
  const currentCategory = (cat || "B").toUpperCase(); // Convert to uppercase for consistent comparison
  
  console.log("📋 Current category from URL:", cat);
  console.log("📋 Displaying title for category:", currentCategory);
  
  if (currentCategory === "C") {
    title = lang === "ar" ? "فئة الشاحنات C" : lang === "nl" ? "Categorie C - Vrachtwagens" : "Catégorie C - Camions";
  } else if (currentCategory === "A") {
    title = lang === "ar" ? "فئة الدراجات النارية A" : lang === "nl" ? "Categorie A - Motorfietsen" : "Catégorie A - Motos";
  } else {
    title = lang === "ar" ? "فئة السيارات B" : lang === "nl" ? "Categorie B - Auto's" : "Catégorie B - Voitures";
  }
  
  console.log("📋 Final title:", title);

  const currentLessons = lessons;

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

  if (loadingLessons) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {lang === "ar" ? "جاري تحميل الدروس..." : lang === "nl" ? "Lessen laden..." : "Chargement des leçons..."}
          </p>
        </div>
      </div>
    );
  }

  if (renewing) {
    return (
      <CheckoutForm
        selectedData={{ catId: `cat-${cat?.toLowerCase()}` }}
        onBack={() => setRenewing(false)}
        prefillData={prefillData}
      />
    );
  }

  if (isExpired || !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 text-center" dir="rtl">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg border-t-8 border-red-500">
          <FaLock className="text-red-500 text-6xl mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">الاشتراك غير متاح</h2>
          <p className="text-gray-500 text-lg mb-8">
            {!userEmail
              ? "لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى."
              : isExpired
              ? `عذراً، انتهت صلاحية الاشتراك المرتبط بالبريد: ${userEmail}`
              : "لم يتم العثور على اشتراك فعال مرتبط بهذا البريد الإلكتروني."}
          </p>
          <div className="flex flex-col gap-3">
            {!userEmail ? (
              <button
                onClick={() => router.push("/")}
                className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-blue-600 transition"
              >
                تسجيل الدخول
              </button>
            ) : (
              <button
                onClick={() => {
                  if (userEmail) {
                    setPrefillData({ email: userEmail });
                  }
                  setRenewing(true);
                }}
                className="bg-brandOrange text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-orange-600 transition"
              >
                تجديد الاشتراك الآن
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* إضافة Navbar */}
      <Navbar />
      
      <div className="px-3 py-4 sm:px-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button - محسّن للموبايل */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition font-bold text-gray-700 hover:text-brandOrange text-sm sm:text-base active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">{lang === "ar" ? "العودة للرئيسية" : lang === "nl" ? "Terug naar Home" : "Retour à l'accueil"}</span>
              <span className="sm:hidden">{lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Retour"}</span>
            </button>
          </div>

          {/* Header - محسّن للموبايل */}
          <header className="mb-6 sm:mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 sm:mb-4 italic uppercase leading-tight">
              {lang === "ar" ? "دورة" : lang === "nl" ? "Cursus" : "Cours"} <span className="text-brandOrange block sm:inline mt-1 sm:mt-0">{title}</span>
            </h1>
            
            {/* معلومات المستخدم - تصميم عمودي للموبايل */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 bg-white px-3 py-2 sm:px-4 rounded-xl shadow-sm border border-gray-100 text-gray-700 text-xs sm:text-sm font-bold">
                <FaEnvelope className="text-brandOrange flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">{lang === "ar" ? "المشترك:" : lang === "nl" ? "Abonnee:" : "Abonné:"} {userEmail}</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-orange-50 px-3 py-2 sm:px-4 rounded-xl shadow-sm border border-orange-100 text-brandOrange text-xs sm:text-sm font-bold">
                <FaClock className="flex-shrink-0" />
                <span>{lang === "ar" ? "الوقت المتبقي:" : lang === "nl" ? "Resterende tijd:" : "Temps restant:"} {timeLeft}</span>
              </div>
            </div>
            
            {/* عدد الدروس */}
            <div className="inline-block bg-orange-100 text-brandOrange px-3 py-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm">
              {lang === "ar" 
                ? `${currentLessons.length} درس متاح`
                : lang === "nl"
                ? `${currentLessons.length} lessen beschikbaar`
                : `${currentLessons.length} leçons disponibles`
              }
            </div>
          </header>

          {/* شريط البحث - محسّن للموبايل */}
          <div className="mb-4 sm:mb-6">
            <input 
              type="text" 
              placeholder={lang === "ar" ? "🔍 ابحث عن درس..." : lang === "nl" ? "🔍 Zoek een les..." : "🔍 Rechercher une leçon..."} 
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-2xl focus:border-brandOrange focus:outline-none transition text-sm sm:text-base" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          {/* قائمة الدروس */}
          {currentLessons.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                {lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : "Aucune leçon disponible"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {lang === "ar" ? "لم يتم إضافة دروس لهذه الفئة بعد" : lang === "nl" ? "Er zijn nog geen lessen toegevoegd voor deze categorie" : "Aucune leçon n'a encore été ajoutée pour cette catégorie"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentLessons.filter(lesson => lesson.title.toLowerCase().includes(searchTerm.toLowerCase())).map((lesson, i) => (
                <div
                  key={lesson.id}
                  onClick={() => router.push(`/lessons/view?lessonId=${lesson.id}&category=${cat || "B"}&email=${userEmail}`)}
                  className="bg-white rounded-2xl sm:rounded-[30px] overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
                >
                  {/* صورة الدرس */}
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                    <FaPlayCircle className="text-brandOrange text-4xl sm:text-5xl opacity-80 group-hover:scale-110 transition-all" />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-brandOrange text-white px-2.5 py-1 sm:px-3 rounded-full text-xs font-bold shadow-lg">
                      {lang === "ar" ? `الدرس ${i + 1}` : lang === "nl" ? `Les ${i + 1}` : `Leçon ${i + 1}`}
                    </div>
                  </div>
                  
                  {/* محتوى الدرس */}
                  <div className="p-4 sm:p-6 text-right">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-snug mb-2">{lesson.title}</h3>
                    <p className="text-gray-400 text-xs italic leading-relaxed">
                      {lang === "ar" 
                        ? "رخصة السياقة البلجيكية - المنهج الرسمي"
                        : lang === "nl"
                        ? "Belgisch rijbewijs - Officieel curriculum"
                        : "Permis de conduire belge - Programme officiel"
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 font-bold">جاري تحميل الدروس...</div>}>
      <LessonsContent />
    </Suspense>
  );
}



