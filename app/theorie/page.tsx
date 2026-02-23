"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaMotorcycle, FaCarSide, FaTruck, FaBook, FaLock } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import CheckoutForm from "@/components/CheckoutForm";

interface Lesson {
  id: number;
  title: string;
  category: string;
  questionType: string;
}

export default function TheoriePage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [globalSelection, setGlobalSelection] = useState<{catId: string, duration: string, catName: string} | null>(null);

  const categories = [
    {
      id: "A",
      name: t.categoryA || "Category A",
      description: t.motorcycles || "Motorcycles",
      icon: <FaMotorcycle className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 25", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    },
    {
      id: "B",
      name: t.categoryB || "Category B",
      description: t.cars || "Cars",
      icon: <FaCarSide className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 25", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    },
    {
      id: "C",
      name: t.categoryC || "Category C",
      description: t.trucks || "Trucks",
      icon: <FaTruck className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 1", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    }
  ];

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const category = localStorage.getItem("userCategory");
    
    console.log("🔍 Checking localStorage:", { email, category });
    
    if (email && category) {
      setUserEmail(email);
      setUserCategory(category);
      setIsLoggedIn(true);
      checkSubscriptionAndFetchLessons(email, category);
    } else {
      // لا يوجد مستخدم مسجل دخول - عرض صفحة الاشتراك
      console.log("ℹ️ No user logged in - showing subscription page");
      setLoading(false);
      setIsLoggedIn(false);
    }
  }, []);

  const checkSubscriptionAndFetchLessons = async (email: string, category: string) => {
    try {
      console.log("🔍 Checking subscription for:", email);
      
      // التحقق من صلاحية الاشتراك
      const subResponse = await fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const subData = await subResponse.json();
      console.log("📡 Subscription response:", subData);

      if (subData.expired || !subData.success) {
        console.log("❌ Subscription expired or failed");
        setIsExpired(true);
        setLoading(false);
        return;
      }

      console.log("✅ Subscription is active");

      // جلب الدروس
      const lessonsResponse = await fetch(`/api/lessons?category=${category}&questionType=Theori`);
      const lessonsData = await lessonsResponse.json();
      console.log("📚 Lessons response:", lessonsData);

      if (lessonsData.success) {
        setLessons(lessonsData.lessons);
        console.log(`✅ Loaded ${lessonsData.lessons.length} lessons`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string, durationKey: string, catName: string) => {
    console.log("📋 Category selected:", categoryId, "Duration:", durationKey);
    setGlobalSelection({ catId: categoryId, duration: durationKey, catName: catName });
  };

  const handleConfirmSelection = () => {
    if (globalSelection) {
      setShowCheckout(true);
    }
  };

  if (showCheckout && globalSelection) {
    console.log("📋 Showing checkout form");
    return (
      <CheckoutForm
        selectedData={globalSelection}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  // إذا لم يكن مسجل دخول - عرض الفئات للاشتراك
  if (!isLoggedIn) {
    console.log("ℹ️ User not logged in - showing subscription page");
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col">
        <Navbar />

        <section className="px-4 md:px-6 py-16 flex-grow flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.theoryTitle || "Theory Lessons"}
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              {lang === "ar" ? "اختر الفئة والمدة المناسبة" : lang === "nl" ? "Kies je categorie en duur" : "Choisissez votre catégorie et durée"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl w-full mx-auto">
            {categories.map((cat) => (
              <div key={cat.id}
                className={`group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 transition-all duration-300 border-2 hover:shadow-2xl relative overflow-hidden ${
                  globalSelection?.catId === cat.id ? "border-orange-500 scale-105 ring-4 ring-orange-100" : "border-gray-100 hover:border-orange-200"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  globalSelection?.catId === cat.id 
                    ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg" 
                    : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-orange-100 group-hover:to-red-100"
                }`}>
                  <div className={globalSelection?.catId === cat.id ? "text-white" : "text-orange-600"}>
                    {cat.icon}
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <h2 className="text-3xl font-black mb-2 text-gray-800">{cat.name}</h2>
                  <p className="text-gray-600 font-medium">{cat.description}</p>
                </div>

                <div className="w-full space-y-3 relative z-10">
                  {cat.options.map((opt) => {
                    const isSelected = globalSelection?.catId === cat.id && globalSelection?.duration === opt.key;
                    return (
                      <button key={opt.key} onClick={() => handleCategorySelect(cat.id, opt.key, cat.name)}
                        className={`w-full flex justify-between items-center rounded-xl p-4 border-2 transition-all duration-200 ${
                          isSelected 
                            ? "border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-md scale-105" 
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        }`}
                      >
                        <span className="font-bold text-lg text-gray-800">{opt.duration}</span>
                        <span className="font-black text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{opt.price}</span>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={handleConfirmSelection}
                  disabled={globalSelection?.catId !== cat.id}
                  className={`w-full mt-2 rounded-xl py-4 font-black text-lg transition-all duration-300 relative z-10 ${
                    globalSelection?.catId === cat.id 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {globalSelection?.catId === cat.id ? (t.confirmSelection || "Bevestigen") : (t.selectPlan || "Selecteer")}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // إذا انتهت صلاحية الاشتراك
  if (isExpired) {
    console.log("⚠️ Subscription expired - showing renewal page");
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border-2 border-red-100">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FaLock className="text-5xl text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">
              {lang === "ar" ? "انتهت صلاحية الاشتراك" : lang === "nl" ? "Abonnement verlopen" : "Abonnement expiré"}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {lang === "ar" ? "يرجى تجديد اشتراكك للوصول إلى الدروس" : lang === "nl" ? "Vernieuw je abonnement om toegang te krijgen tot lessen" : "Renouvelez votre abonnement pour accéder aux leçons"}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // مسح البيانات القديمة وإعادة تحميل الصفحة
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("userCategory");
                  localStorage.removeItem("userExpiry");
                  setIsLoggedIn(false);
                  setIsExpired(false);
                  setUserEmail("");
                  setUserCategory("");
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-black hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {lang === "ar" ? "تجديد الاشتراك" : lang === "nl" ? "Abonnement vernieuwen" : "Renouveler"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {lang === "ar" ? "العودة للرئيسية" : lang === "nl" ? "Terug naar Home" : "Retour à l'accueil"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض الدروس
  console.log("📚 Showing lessons page", { isLoggedIn, loading, lessonsCount: lessons.length });
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {lang === "ar" ? "دروس النظري" : lang === "nl" ? "Theorie Lessen" : "Leçons théoriques"}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            {lang === "ar" ? `الفئة ${userCategory}` : lang === "nl" ? `Categorie ${userCategory}` : `Catégorie ${userCategory}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">
                {lang === "ar" ? "جاري التحميل..." : lang === "nl" ? "Laden..." : "Chargement..."}
              </p>
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FaBook className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              {lang === "ar" ? "لا توجد دروس" : lang === "nl" ? "Geen lessen" : "Aucune leçon"}
            </h3>
            <p className="text-gray-600">
              {lang === "ar" ? "لم يتم إضافة دروس لهذه الفئة بعد" : lang === "nl" ? "Er zijn nog geen lessen toegevoegd voor deze categorie" : "Aucune leçon n'a encore été ajoutée pour cette catégorie"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => router.push(`/theorie/lesson?category=${userCategory}&email=${userEmail}&lesson=${encodeURIComponent(lesson.title)}`)}
                className="group bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer hover:scale-105 border-2 border-gray-100 hover:border-blue-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaBook className="text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 relative z-10">
                  <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                    {lang === "ar" ? "انقر للبدء" : lang === "nl" ? "Klik om te starten" : "Cliquez pour commencer"}
                  </span>
                  <svg className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
