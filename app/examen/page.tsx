"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaMotorcycle, FaCarSide, FaTruck, FaPlayCircle, FaEye, FaBook, FaCar } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import CheckoutForm from "@/components/CheckoutForm";

export default function ExamenPage() {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  const [examType, setExamType] = useState<"" | "theorie" | "praktijk">("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [showCategories, setShowCategories] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [globalSelection, setGlobalSelection] = useState<{catId: string, duration: string, catName: string} | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  const theorieCategories = [
    {
      id: "cat-a",
      name: t.categoryA || "Category A",
      description: t.motorcycles || "Motorcycles",
      icon: <FaMotorcycle className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 25", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    },
    {
      id: "cat-b",
      name: t.categoryB || "Category B",
      description: t.cars || "Cars",
      icon: <FaCarSide className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 25", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    },
    {
      id: "cat-c",
      name: t.categoryC || "Category C",
      description: t.trucks || "Trucks",
      icon: <FaTruck className="text-5xl text-brandOrange" />,
      options: [
        { duration: t.twoWeeks || "2 Weeks", price: "€ 25", key: "2w" },
        { duration: t.oneMonth || "1 Month", price: "€ 50", key: "1m" },
      ],
    }
  ];

  const praktijkOptions = [
    {
      id: "lessons",
      name: t.drivingLessons || "Oefenvideo's",
      description: t.lessonsDesc || "Volledige uitleg van alle verkeersregels met beeld en geluid",
      icon: <FaPlayCircle className="text-5xl text-brandOrange" />,
      price: "€49"
    },
    {
      id: "exam",
      name: t.practicalExam || "Gevaarherkenning",
      description: t.examDesc || "Praktijkgerichte video-oefeningen om je voor te bereiden op het examen",
      icon: <FaEye className="text-5xl text-brandOrange" />,
      price: "€39"
    }
  ];

  useEffect(() => {
    // حفظ بيانات المستخدم في localStorage إذا كانت موجودة في URL
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
    if (selectedCategory) {
      localStorage.setItem("userCategory", selectedCategory);
    }

    const stored = localStorage.getItem("renewPrefillData");
    if (stored) {
      setPrefillData(JSON.parse(stored));
    }

    // التحقق من وجود بيانات الاشتراك في URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get("email");
      const cat = urlParams.get("cat");
      
      if (email && cat) {
        setUserEmail(email);
        setSelectedCategory(cat);
        setExamType("theorie");
      }
    }
  }, [userEmail, selectedCategory]);

  // جلب الدروس المتاحة عند اختيار الفئة
  useEffect(() => {
    if (selectedCategory && examType === "theorie") {
      fetchAvailableLessons();
    }
  }, [selectedCategory, examType]);

  const fetchAvailableLessons = async () => {
    try {
      // تحويل الفئة إلى تنسيق الامتحانات
      const examCategory = `exam${selectedCategory}`;
      console.log("🔍 Fetching lessons for exam category:", examCategory);
      
      // جلب جميع الدروس من قاعدة البيانات للفئة المحددة
      const response = await fetch(`/api/lessons?category=${examCategory}&questionType=Examen`);
      const data = await response.json();
      
      console.log("📊 Lessons response:", data);
      
      if (data.success && data.lessons) {
        setAvailableLessons(data.lessons.map((l: any) => l.title));
        console.log(`✅ Loaded ${data.lessons.length} lessons`);
      } else {
        console.log("⚠️ No lessons found for category:", examCategory);
      }
    } catch (error) {
      console.error("❌ Error fetching lessons:", error);
    }
  };

  const handleSelectPrice = (categoryId: string, durationKey: string, catName: string) => {
    setGlobalSelection({ catId: categoryId, duration: durationKey, catName: catName });
    // تحديد الفئة لجلب الدروس
    const categoryMap: Record<string, string> = {
      "cat-a": "A",
      "cat-b": "B",
      "cat-c": "C"
    };
    setSelectedCategory(categoryMap[categoryId] || "B");
  };

  const handleProceedToLessons = (email: string) => {
    setUserEmail(email);
    setIsCheckout(false);
    // الآن سيتم عرض قائمة الدروس
  };

  const handleLessonSelect = (lesson: string) => {
    // الانتقال إلى صفحة الاختبار
    router.push(`/examen/test?category=${selectedCategory}&lesson=${encodeURIComponent(lesson)}&email=${encodeURIComponent(userEmail)}`);
  };

  const handlePraktijkSelect = (id: string) => {
    setGlobalSelection({ catId: id, duration: "praktical", catName: id });
  };

  if (isCheckout && globalSelection) {
    return (
      <CheckoutForm
        selectedData={globalSelection}
        onBack={() => {
          setIsCheckout(false);
          setGlobalSelection(null);
        }}
        prefillData={prefillData}
      />
    );
  }

  // عرض قائمة الدروس بعد الدفع
  if (userEmail && selectedCategory && examType === "theorie") {
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <section className="px-6 py-16 flex-grow">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setUserEmail("");
                setSelectedCategory("");
                setAvailableLessons([]);
                setSelectedLesson("");
                setExamType("");
              }}
              className="mb-6 text-brandOrange font-bold hover:underline flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {lang === "ar" ? "اختر الدرس" : lang === "nl" ? "Kies een les" : "Choisissez une leçon"}
              </h1>
              <p className="text-gray-600">
                {lang === "ar" ? `الفئة ${selectedCategory}` : lang === "nl" ? `Categorie ${selectedCategory}` : `Catégorie ${selectedCategory}`}
              </p>
            </div>

            {availableLessons.length > 0 ? (
              <div className="grid gap-4">
                {availableLessons.map((lesson, index) => (
                  <button
                    key={index}
                    onClick={() => handleLessonSelect(lesson)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-orange-500 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{lesson}</h3>
                        <p className="text-sm text-gray-500">
                          {lang === "ar" ? "انقر لبدء الاختبار" : lang === "nl" ? "Klik om de test te starten" : "Cliquez pour commencer le test"}
                        </p>
                      </div>
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : "Aucune leçon disponible"}
                </h2>
                <p className="text-gray-600">
                  {lang === "ar" ? "لم يتم إضافة دروس لهذه الفئة بعد" : lang === "nl" ? "Er zijn nog geen lessen toegevoegd voor deze categorie" : "Aucune leçon n'a encore été ajoutée pour cette catégorie"}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col">
      <Navbar />

      <section className="px-4 md:px-6 py-12 flex-grow flex flex-col items-center">
        {!examType ? (
          // اختيار نوع الامتحان
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {lang === "ar" ? "اختر نوع الامتحان" : lang === "nl" ? "Kies je examen type" : "Choisissez votre type d'examen"}
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {lang === "ar" ? "ابدأ رحلتك للحصول على رخصة القيادة" : lang === "nl" ? "Begin je reis naar je rijbewijs" : "Commencez votre voyage vers votre permis"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full mx-auto">
              <button
                onClick={() => {
                  setExamType("theorie");
                  setShowCategories(true);
                }}
                className="group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-400 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all">
                  <FaBook className="text-5xl text-white" />
                </div>
                <div className="text-center relative z-10">
                  <h2 className="text-3xl font-black mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {lang === "ar" ? "امتحان النظري" : lang === "nl" ? "Theorie Examen" : "Examen Théorique"}
                  </h2>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    {lang === "ar" ? "اختبارات نظرية للفئات A, B, C" : lang === "nl" ? "Theorie examens voor categorieën A, B, C" : "Examens théoriques pour catégories A, B, C"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-blue-600 font-bold">
                    <span>{lang === "ar" ? "ابدأ الآن" : lang === "nl" ? "Start nu" : "Commencer"}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setExamType("praktijk");
                  setShowCategories(true);
                }}
                className="group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-400 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg group-hover:shadow-xl transition-all">
                  <FaCar className="text-5xl text-white" />
                </div>
                <div className="text-center relative z-10">
                  <h2 className="text-3xl font-black mb-3 text-gray-800 group-hover:text-green-600 transition-colors">
                    {lang === "ar" ? "امتحان العملي" : lang === "nl" ? "Praktijk Examen" : "Examen Pratique"}
                  </h2>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    {lang === "ar" ? "فيديوهات تدريبية وإدراك المخاطر" : lang === "nl" ? "Oefenvideo's en Gevaarherkenning" : "Vidéos d'entraînement et Perception des dangers"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-green-600 font-bold">
                    <span>{lang === "ar" ? "ابدأ الآن" : lang === "nl" ? "Start nu" : "Commencer"}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : examType === "theorie" ? (
          // عرض فئات Theorie
          <>
            <button
              onClick={() => {
                setExamType("");
                setShowCategories(false);
                setGlobalSelection(null);
              }}
              className="self-start mb-8 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
            </button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {lang === "ar" ? "امتحان النظري" : lang === "nl" ? "Theorie Examen" : "Examen Théorique"}
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                {lang === "ar" ? "اختر الفئة والمدة المناسبة" : lang === "nl" ? "Kies je categorie en duur" : "Choisissez votre catégorie et durée"}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl w-full mx-auto">
              {theorieCategories.map((cat) => (
                <div
                  key={cat.id}
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
                        <button
                          key={opt.key}
                          onClick={() => handleSelectPrice(cat.id, opt.key, cat.name)}
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
                    onClick={() => setIsCheckout(true)}
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
          </>
        ) : (
          // عرض خيارات Praktijk
          <>
            <button
              onClick={() => {
                setExamType("");
                setShowCategories(false);
                setGlobalSelection(null);
              }}
              className="self-start mb-8 flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
            </button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {lang === "ar" ? "امتحان العملي" : lang === "nl" ? "Praktijk Examen" : "Examen Pratique"}
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                {lang === "ar" ? "اختر نوع التدريب المناسب" : lang === "nl" ? "Kies je trainingstype" : "Choisissez votre type de formation"}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-5xl w-full mx-auto">
              {praktijkOptions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePraktijkSelect(item.id)}
                  className={`group bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center text-center gap-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-2xl relative overflow-hidden ${
                    globalSelection?.catId === item.id 
                      ? "border-green-500 scale-105 ring-4 ring-green-100" 
                      : "border-gray-100 hover:border-green-200"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className={`relative p-6 rounded-2xl transition-all duration-300 ${
                    globalSelection?.catId === item.id 
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg" 
                      : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100"
                  }`}>
                    <div className={globalSelection?.catId === item.id ? "text-white" : "text-green-600"}>
                      {item.icon}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-3xl font-black text-gray-800 mb-3">{item.name}</h2>
                    <p className="text-gray-600 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-2">
                    <div className="inline-flex items-baseline gap-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                      <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{item.price}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (globalSelection?.catId === item.id) {
                        setIsCheckout(true);
                      }
                    }}
                    disabled={globalSelection?.catId !== item.id}
                    className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 relative z-10 ${
                      globalSelection?.catId === item.id 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {globalSelection?.catId === item.id ? (t.confirmSelection || "Bevestigen") : (t.selectPlan || "Selecteer")}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
