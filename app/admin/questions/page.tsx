"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import adminTranslations from "@/locales/admin.json";

interface Question {
  id: number;
  text: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
  videoUrls?: string[];
  audioUrl?: string;
}

export default function AdminQuestionsPage() {
  const { lang, setLang } = useLang();
  const t = adminTranslations[lang as keyof typeof adminTranslations];
  
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [questionType, setQuestionType] = useState<"" | "Theori" | "Praktijk" | "Examen">("");

  const [category, setCategory] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lessons, setLessons] = useState<{id: number, name: string}[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editImages, setEditImages] = useState<File[]>([]);

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    textNL: "",
    textFR: "",
    textAR: "",
    explanationNL: "",
    explanationFR: "",
    explanationAR: "",
    answer1: "",
    answer2: "",
    answer3: "",
    correctAnswer: 0,
    videos: [] as File[],
    audio: null as File | null,
  });

  const lessonsMap: Record<string, any> = {
    A: {
      nl: [
        { id: 4, name: "Motorfiets wetgeving (A) - Introductie" },
        { id: 9, name: "Veiligheidsuitrusting en helm" },
        { id: 10, name: "Balans en manoeuvres op de weg" },
        { id: 11, name: "Correcte positionering in de rijstrook" },
        { id: 12, name: "Verkeersborden specifiek voor motoren" },
        { id: 13, name: "Omgaan met bochten en gladde oppervlakken" },
        { id: 14, name: "Passagiers en lading op de motor" },
        { id: 15, name: "Basis motorfiets mechanica" },
        { id: 16, name: "Zicht en dode hoeken voor motoren" },
        { id: 17, name: "Snelheidsregels voor lichte motoren" },
        { id: 18, name: "Eerste hulp voor motorrijders" },
        { id: 19, name: "Rijden in groepen" },
        { id: 20, name: "Proefexamen categorie A" }
      ],
      fr: [
        { id: 4, name: "Législation moto (A) - Introduction" },
        { id: 9, name: "Équipement de sécurité et casque" },
        { id: 10, name: "Équilibre et manœuvres sur route" },
        { id: 11, name: "Positionnement correct dans la voie" },
        { id: 12, name: "Panneaux de signalisation spécifiques aux motos" },
        { id: 13, name: "Gestion des virages et surfaces glissantes" },
        { id: 14, name: "Passagers et chargement sur la moto" },
        { id: 15, name: "Mécanique de base de la moto" },
        { id: 16, name: "Visibilité et angles morts pour motos" },
        { id: 17, name: "Règles de vitesse pour motos légères" },
        { id: 18, name: "Premiers secours pour motards" },
        { id: 19, name: "Conduite en groupe" },
        { id: 20, name: "Examen blanc catégorie A" }
      ],
      ar: [
        { id: 4, name: "قوانين الدراجات النارية (A) - مقدمة" },
        { id: 9, name: "تجهيزات السلامة والخوذة" },
        { id: 10, name: "التوازن والمناورات على الطريق" },
        { id: 11, name: "التموضع الصحيح في المسار" },
        { id: 12, name: "الإشارات المرورية الخاصة بالموتور" },
        { id: 13, name: "التعامل مع المنعطفات والأسطح الزلقة" },
        { id: 14, name: "الركاب والحمولة على الدراجة" },
        { id: 15, name: "ميكانيك الدراجة النارية الأساسي" },
        { id: 16, name: "الرؤية والنقاط العمياء للموتور" },
        { id: 17, name: "قواعد السرعة للمحركات الخفيفة" },
        { id: 18, name: "الإسعافات الأولية لراكبي الدراجات" },
        { id: 19, name: "القيادة في مجموعات" },
        { id: 20, name: "امتحان تجريبي فئة A" }
      ]
    },
    B: {
      nl: [
        { id: 6, name: "Auto wetgeving (B) - Introductie" },
        { id: 21, name: "Snelheden binnen en buiten de stad" },
        { id: 22, name: "Voorrangsregels en kruispunten" },
        { id: 23, name: "Verticale verkeersborden" },
        { id: 24, name: "Wegmarkeringen en lijnen" },
        { id: 25, name: "Correct parkeren en stoppen" },
        { id: 26, name: "Veilig inhalen en manoeuvres" },
        { id: 27, name: "Lichte auto mechanica" },
        { id: 28, name: "Zicht en rijden in moeilijke omstandigheden" },
        { id: 29, name: "Economisch rijden (Eco-Driving)" },
        { id: 30, name: "Ongevallen en wettelijke aansprakelijkheid" },
        { id: 31, name: "Kwetsbare weggebruikers (voetgangers)" },
        { id: 32, name: "Proefexamen categorie B" }
      ],
      fr: [
        { id: 6, name: "Législation voiture (B) - Introduction" },
        { id: 21, name: "Vitesses en ville et hors agglomération" },
        { id: 22, name: "Règles de priorité et intersections" },
        { id: 23, name: "Panneaux de signalisation verticaux" },
        { id: 24, name: "Marquages au sol et lignes" },
        { id: 25, name: "Stationnement et arrêt corrects" },
        { id: 26, name: "Dépassement sûr et manœuvres" },
        { id: 27, name: "Mécanique automobile légère" },
        { id: 28, name: "Visibilité et conduite en conditions difficiles" },
        { id: 29, name: "Conduite économique (Eco-Driving)" },
        { id: 30, name: "Accidents et responsabilité légale" },
        { id: 31, name: "Usagers vulnérables (piétons)" },
        { id: 32, name: "Examen blanc catégorie B" }
      ],
      ar: [
        { id: 6, name: "قوانين السيارات (B) - مقدمة" },
        { id: 21, name: "السرعات داخل وخارج المدينة" },
        { id: 22, name: "قواعد الأولوية والتقاطعات" },
        { id: 23, name: "الإشارات المرورية العمودية" },
        { id: 24, name: "العلامات الأرضية والخطوط" },
        { id: 25, name: "الوقوف والتوقف الصحيح" },
        { id: 26, name: "التجاوز الآمن والمناورات" },
        { id: 27, name: "ميكانيك السيارة الخفيفة" },
        { id: 28, name: "الرؤية والقيادة في ظروف صعبة" },
        { id: 29, name: "السياقة الاقتصادية (Eco-Driving)" },
        { id: 30, name: "الحوادث والمسؤولية القانونية" },
        { id: 31, name: "مستخدمو الطريق الضعفاء (المشاة)" },
        { id: 32, name: "امتحان تجريبي فئة B" }
      ]
    },
    C: {
      nl: [
        { id: 33, name: "Vrachtwagen wetgeving (C) - Gewichten en afmetingen" },
        { id: 34, name: "Tachograaf en rusttijden" },
        { id: 35, name: "Ladingverdeling en lading beveiligen" },
        { id: 36, name: "Zware voertuig mechanica" },
        { id: 37, name: "Luchtremsystemen (Air Brakes)" },
        { id: 38, name: "Dode hoeken in grote voertuigen" },
        { id: 39, name: "Verkeersregels voor zwaar transport" },
        { id: 40, name: "Verboden wegen en hoogtebeperkingen" },
        { id: 41, name: "Internationale documenten en carnets" },
        { id: 42, name: "Banden vervangen en pech afhandelen" },
        { id: 43, name: "Veilig laden en lossen" },
        { id: 44, name: "Pre-trip inspectie voor vrachtwagens" },
        { id: 45, name: "Proefexamen categorie C" }
      ],
      fr: [
        { id: 33, name: "Législation camion (C) - Poids et dimensions" },
        { id: 34, name: "Tachygraphe et temps de repos" },
        { id: 35, name: "Répartition et sécurisation du chargement" },
        { id: 36, name: "Mécanique des véhicules lourds" },
        { id: 37, name: "Systèmes de freinage pneumatique" },
        { id: 38, name: "Angles morts dans les grands véhicules" },
        { id: 39, name: "Règles de circulation pour transport lourd" },
        { id: 40, name: "Routes interdites et restrictions de hauteur" },
        { id: 41, name: "Documents internationaux et carnets" },
        { id: 42, name: "Changement de pneus et gestion des pannes" },
        { id: 43, name: "Chargement et déchargement sécurisés" },
        { id: 44, name: "Inspection pré-départ pour camions" },
        { id: 45, name: "Examen blanc catégorie C" }
      ],
      ar: [
        { id: 33, name: "قوانين الشاحنات (C) - الأوزان والأبعاد" },
        { id: 34, name: "جهاز التاكوغراف وأوقات الراحة" },
        { id: 35, name: "توزيع الأحمال وتأمين الشحنة" },
        { id: 36, name: "ميكانيك المحركات الثقيلة" },
        { id: 37, name: "أنظمة الفرامل الهوائية (Air Brakes)" },
        { id: 38, name: "الزوايا الميتة في المركبات الكبيرة" },
        { id: 39, name: "قواعد المرور الخاصة بالشحن الثقيل" },
        { id: 40, name: "الطرق المحظورة وقيود الارتفاع" },
        { id: 41, name: "المستندات الدولية ودفاتر المرور" },
        { id: 42, name: "تغيير الإطارات والتعامل مع الأعطال" },
        { id: 43, name: "التحميل والتفريغ الآمن" },
        { id: 44, name: "فحص ما قبل الانطلاق للشاحنة" },
        { id: 45, name: "امتحان تجريبي فئة C" }
      ]
    }
  };

  // خيارات خاصة بـ Praktijk
  const praktijkLessonsMap: Record<string, any> = {
    training: {
      nl: [
        "Introductie tot verkeersveiligheid",
        "Verkeerstekens en wegmarkeringen",
        "Voorrangsregels op kruispunten",
        "Snelheidslimieten en afstanden",
        "Veilig inhalen en invoegen",
        "Rijden in het donker",
        "Rijden bij slecht weer",
        "Parkeren en keren",
        "Rotondes en complexe kruispunken",
        "Defensief rijden",
        "Milieubewust rijden",
        "Eerste hulp bij ongevallen"
      ],
      fr: [
        "Introduction à la sécurité routière",
        "Panneaux et marquages routiers",
        "Règles de priorité aux intersections",
        "Limites de vitesse et distances",
        "Dépassement et insertion en sécurité",
        "Conduite de nuit",
        "Conduite par mauvais temps",
        "Stationnement et demi-tour",
        "Ronds-points et intersections complexes",
        "Conduite défensive",
        "Conduite écologique",
        "Premiers secours en cas d'accident"
      ],
      ar: [
        "مقدمة في السلامة المرورية",
        "إشارات المرور وعلامات الطريق",
        "قواعد الأولوية في التقاطعات",
        "حدود السرعة والمسافات",
        "التجاوز والاندماج الآمن",
        "القيادة في الظلام",
        "القيادة في الطقس السيئ",
        "الوقوف والدوران",
        "الدوارات والتقاطعات المعقدة",
        "القيادة الدفاعية",
        "القيادة الصديقة للبيئة",
        "الإسعافات الأولية عند الحوادث"
      ]
    },
    hazard: {
      nl: [
        "Gevaarherkenning - Stedelijk verkeer",
        "Gevaarherkenning - Snelweg",
        "Gevaarherkenning - Landelijke wegen",
        "Gevaarherkenning - Kruispunten",
        "Gevaarherkenning - Voetgangers",
        "Gevaarherkenning - Fietsers",
        "Gevaarherkenning - Slecht weer",
        "Gevaarherkenning - Nacht rijden",
        "Gevaarherkenning - Kinderen",
        "Gevaarherkenning - Dieren",
        "Gevaarherkenning - Werkzaamheden",
        "Gevaarherkenning - Examen simulatie"
      ],
      fr: [
        "Perception des dangers - Circulation urbaine",
        "Perception des dangers - Autoroute",
        "Perception des dangers - Routes rurales",
        "Perception des dangers - Intersections",
        "Perception des dangers - Piétons",
        "Perception des dangers - Cyclistes",
        "Perception des dangers - Mauvais temps",
        "Perception des dangers - Conduite de nuit",
        "Perception des dangers - Enfants",
        "Perception des dangers - Animaux",
        "Perception des dangers - Travaux routiers",
        "Perception des dangers - Simulation d'examen"
      ],
      ar: [
        "إدراك المخاطر - حركة المرور الحضرية",
        "إدراك المخاطر - الطريق السريع",
        "إدراك المخاطر - الطرق الريفية",
        "إدراك المخاطر - التقاطعات",
        "إدراك المخاطر - المشاة",
        "إدراك المخاطر - راكبو الدراجات",
        "إدراك المخاطر - الطقس السيئ",
        "إدراك المخاطر - القيادة الليلية",
        "إدراك المخاطر - الأطفال",
        "إدراك المخاطر - الحيوانات",
        "إدراك المخاطر - أعمال الطرق",
        "إدراك المخاطر - محاكاة الاختبار"
      ]
    }
  };

  const handleLogin = () => {
    if (user === "rami" && password === "123") {
      setIsLogged(true);
    } else {
      alert(t.incorrectCredentials);
    }
  };

  // إعادة تعيين الفئة عند تغيير نوع السؤال
  useEffect(() => {
    setCategory("");
    setLessons([]);
    setLessonId("");
    setQuestions([]);
  }, [questionType]);

  useEffect(() => {
    if (category) {
      // جلب الدروس من السيرفر لجميع الأنواع
      fetchLessonsFromServer();
      setSelectedLesson("");
      setQuestions([]);
    }
  }, [category, questionType, lang]);

  const fetchLessonsFromServer = async () => {
    try {
      let url = '';
      
      if (questionType === "Praktijk") {
        // جلب دروس Praktijk
        url = `/api/praktijk/lessons?type=${category}`;
      } else {
        // جلب دروس Theori/Examen من LessonA/B/C
        url = `/api/lessons?category=${category}`;
      }
      
      console.log(`🔍 Fetching lessons from: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.lessons) {
        const formattedLessons = data.lessons.map((lesson: any) => ({
          id: lesson.id,
          name: lesson.title
        }));
        setLessons(formattedLessons);
        console.log(`✅ Loaded ${formattedLessons.length} lessons`);
      } else {
        console.error("❌ Failed to fetch lessons:", data.message);
        setLessons([]);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setLessons([]);
    }
  };

  const fetchQuestions = async () => {
    if (!lessonId) return;

    try {
      let url = '';
      
      if (questionType === "Examen") {
        // للامتحانات: جلب من جداول ExamQuestion
        url = `/api/exam-questions?lessonId=${lessonId}`;
      } else if (questionType === "Praktijk") {
        // لـ Praktijk: جلب من جدول PraktijkQuestion
        url = `/api/praktijk/questions?lessonId=${lessonId}`;
      } else {
        // للدروس: جلب من جداول Question
        url = `/api/questions?lessonId=${lessonId}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions);
        console.log(`✅ Loaded ${data.questions.length} questions for lessonId:`, lessonId);
      }
    } catch (err) {
      console.error("خطأ عند جلب الأسئلة:", err);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  const handleAddQuestion = async () => {
    if (questionType === "Examen") {
      // للامتحانات: التحقق من السؤال بالهولندية والإجابات
      if (!lessonId || !newQuestion.textNL) {
        return alert("يجب كتابة السؤال بالهولندية");
      }
      if (!newQuestion.answer1 || !newQuestion.answer2 || !newQuestion.answer3) {
        return alert("يجب إدخال 3 إجابات");
      }
      if (newQuestion.correctAnswer === 0) {
        return alert("يجب اختيار الإجابة الصحيحة");
      }
    } else {
      // للدروس و Praktijk: التحقق من السؤال بلغة واحدة على الأقل
      if (!lessonId || (!newQuestion.textNL && !newQuestion.textFR && !newQuestion.textAR)) {
        return alert("يجب كتابة السؤال بلغة واحدة على الأقل");
      }
    }

    const formData = new FormData();
    formData.append("lessonId", lessonId);
    
    if (questionType === "Examen") {
      // للامتحانات: حفظ في ExamQuestion
      formData.append("textNL", newQuestion.textNL);
      formData.append("answer1", newQuestion.answer1);
      formData.append("answer2", newQuestion.answer2);
      formData.append("answer3", newQuestion.answer3);
      formData.append("correctAnswer", newQuestion.correctAnswer.toString());
    } else {
      // للدروس و Praktijk: حفظ في Question أو PraktijkQuestion
      formData.append("text", newQuestion.textNL || newQuestion.textFR || newQuestion.textAR || "");
      formData.append("textNL", newQuestion.textNL);
      formData.append("textFR", newQuestion.textFR);
      formData.append("textAR", newQuestion.textAR);
      formData.append("explanationNL", newQuestion.explanationNL);
      formData.append("explanationFR", newQuestion.explanationFR);
      formData.append("explanationAR", newQuestion.explanationAR);
    }

    newQuestion.videos.forEach(video => {
      formData.append("videos", video);
    });

    if (newQuestion.audio) formData.append("audio", newQuestion.audio);

    try {
      // استخدام API المناسب
      let apiUrl = '';
      if (questionType === "Examen") {
        apiUrl = "/api/exam-questions";
      } else if (questionType === "Praktijk") {
        apiUrl = "/api/praktijk/questions";
      } else {
        apiUrl = "/api/questions";
      }
      
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API Error Response:", text);
        console.error("❌ Status Code:", res.status);
        alert(`خطأ من السيرفر: ${text}`);
        return;
      }

      const data = await res.json();
      console.log("📦 Response data:", data);
      
      if (!data.success) {
        console.error("❌ Save failed:", data.message);
        alert(`فشل حفظ السؤال: ${data.message}`);
        return;
      }

      console.log("✅ Question saved successfully!");
      alert("✅ تم حفظ السؤال بنجاح!");
      fetchQuestions();
      setNewQuestion({ 
        text: "",
        textNL: "",
        textFR: "",
        textAR: "",
        explanationNL: "",
        explanationFR: "",
        explanationAR: "",
        answer1: "",
        answer2: "",
        answer3: "",
        correctAnswer: 0,
        videos: [], 
        audio: null 
      });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: any) => input.value = '');
    } catch (err) {
      console.error("خطأ عند حفظ السؤال:", err);
      alert("فشل الاتصال بالسيرفر");
    }
  };
  const handleEditQuestion = async (questionId: number) => {
    if (!editText) {
      alert("أدخل نص السؤال");
      return;
    }

    const formData = new FormData();
    formData.append("id", questionId.toString());
    formData.append("text", editText);

    editImages.forEach(img => {
      formData.append("images", img);
    });

    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("تم تعديل السؤال بنجاح");
        setEditingQuestion(null);
        setEditImages([]);
        fetchQuestions();
      }
    } catch (error) {
      console.error("خطأ في التعديل:", error);
      alert("فشل تعديل السؤال");
    }
  };

  const handleDeleteImage = async (questionId: number, imageUrl: string) => {
    if (!confirm("هل تريد حذف هذه الصورة؟")) return;

    try {
      const res = await fetch("/api/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, imageUrl }),
      });

      const data = await res.json();
      if (data.success) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("خطأ في حذف الصورة:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;

    try {
      // استخدام API المناسب
      let apiUrl = '';
      if (questionType === "Examen") {
        apiUrl = "/api/exam-questions";
      } else if (questionType === "Praktijk") {
        apiUrl = "/api/praktijk/questions";
      } else {
        apiUrl = "/api/questions";
      }
      
      const url = `${apiUrl}?id=${questionId}`;
      
      const res = await fetch(url, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("تم حذف السؤال بنجاح");
        fetchQuestions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      alert("فشل حذف السؤال");
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{t.adminLogin}</h1>
            <p className="text-gray-500 mt-2">{t.manageQuestions}</p>
          </div>
          <input
            type="text"
            placeholder={t.username}
            className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:border-orange-500 focus:outline-none transition"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <input
            type="password"
            placeholder={t.password}
            className="w-full p-4 border-2 border-gray-200 rounded-lg mb-6 focus:border-orange-500 focus:outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition shadow-lg"
            onClick={handleLogin}
          >
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  // شاشة اختيار نوع الأسئلة
  if (!questionType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{t.chooseQuestionType}</h1>
            <p className="text-gray-500 mt-2">{t.selectType}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => setQuestionType("Theori")}
              className="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 hover:border-green-500 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.theori}</h3>
              <p className="text-gray-600">{t.theoryQuestions}</p>
            </button>

            <button
              onClick={() => setQuestionType("Praktijk")}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.praktijk}</h3>
              <p className="text-gray-600">{t.practicalQuestions}</p>
            </button>

            <button
              onClick={() => setQuestionType("Examen")}
              className="group bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-8 hover:border-orange-500 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.examen}</h3>
              <p className="text-gray-600">{t.examQuestions}</p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogged(false)}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              {t.backToLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                إدارة وتنظيم الأسئلة
              </h1>
              <p className="text-gray-500 mt-1 mr-15">
                {t.systemManagement} {questionType}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLang("nl")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${lang === "nl" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                NL
              </button>
              <button
                onClick={() => setLang("fr")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${lang === "fr" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                FR
              </button>
              <button
                onClick={() => setLang("ar")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${lang === "ar" ? "bg-gradient-to-r from-green-400 to-cyan-400 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"}`}
              >
                AR
              </button>
              <button
                onClick={() => setQuestionType("")}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                {t.changeType}
              </button>
              <button
                onClick={() => setIsLogged(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t.filterQuestions}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {questionType === "Praktijk" ? (
              // خيارات خاصة بـ Praktijk
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المحتوى</label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">اختر نوع المحتوى</option>
                  <option value="training">فيديوهات تدريبية</option>
                  <option value="hazard">إدراك المخاطر</option>
                </select>
              </div>
            ) : (
              // الفئات العادية لـ Theori و Examen
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">اختر الفئة</option>
                  <option value="A"> فئة الموتورات (A)</option>
                  <option value="B"> فئة السيارات (B)</option>
                  <option value="C"> فئة الشاحنات (C)</option>
                </select>
              </div>
            )}

            {lessons.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدرس</label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                >
                  <option value="">اختر الدرس</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        {lessonId && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة سؤال جديد
            </h2>
            <div className="space-y-4">
              {/* حقول السؤال - للامتحانات بالهولندية فقط */}
              {questionType === "Examen" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🇳🇱 نص السؤال بالهولندية (Nederlands)
                  </label>
                  <textarea
                    placeholder="Vraag in het Nederlands..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition resize-none"
                    rows={4}
                    value={newQuestion.textNL}
                    onChange={(e) => setNewQuestion({ ...newQuestion, textNL: e.target.value })}
                  />
                </div>
              ) : (
                /* حقول السؤال بثلاث لغات للدروس */
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  نص السؤال بثلاث لغات
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇳🇱 السؤال بالهولندية (Nederlands)
                    </label>
                    <textarea
                      placeholder="Vraag in het Nederlands..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.textNL}
                      onChange={(e) => setNewQuestion({ ...newQuestion, textNL: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇫🇷 السؤال بالفرنسية (Français)
                    </label>
                    <textarea
                      placeholder="Question en français..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.textFR}
                      onChange={(e) => setNewQuestion({ ...newQuestion, textFR: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇸🇦 السؤال بالعربية (العربية)
                    </label>
                    <textarea
                      placeholder="السؤال بالعربية..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.textAR}
                      onChange={(e) => setNewQuestion({ ...newQuestion, textAR: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* حقول الشرح بثلاث لغات - للدروس فقط */}
              {questionType !== "Examen" && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  الشرح بثلاث لغات
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇳🇱 الشرح بالهولندية (Nederlands)
                    </label>
                    <textarea
                      placeholder="Uitleg in het Nederlands..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.explanationNL}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanationNL: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇫🇷 الشرح بالفرنسية (Français)
                    </label>
                    <textarea
                      placeholder="Explication en français..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.explanationFR}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanationFR: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇸🇦 الشرح بالعربية (العربية)
                    </label>
                    <textarea
                      placeholder="الشرح بالعربية..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                      rows={3}
                      value={newQuestion.explanationAR}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanationAR: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* حقول الإجابات (للامتحانات فقط) */}
              {questionType === "Examen" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    خيارات الإجابة (3 خيارات)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الأولى
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الأولى..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer1}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الثانية
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الثانية..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer2}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer2: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الثالثة
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الثالثة..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer3}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer3: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الصحيحة
                      </label>
                      <select
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                      >
                        <option value={0}>اختر الإجابة الصحيحة</option>
                        <option value={1}>الإجابة الأولى</option>
                        <option value={2}>الإجابة الثانية</option>
                        <option value={3}>الإجابة الثالثة</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     الفيديوهات (يمكن اختيار أكثر من فيديو)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNewQuestion({ ...newQuestion, videos: files });
                    }}
                  />
                  {newQuestion.videos.length > 0 && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                       تم اختيار {newQuestion.videos.length} فيديو
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"> ملف صوتي</label>
                  <input
                    type="file"
                    accept="audio/*"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        audio: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>
              </div>
              <button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
                onClick={handleAddQuestion}
              >
                 حفظ السؤال
              </button>
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder=" ابحث عن سؤال..."
                  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                الأسئلة المتاحة ({filteredQuestions.length})
              </h2>
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition bg-gradient-to-r from-white to-gray-50"
                >
                  {editingQuestion?.id === q.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition resize-none"
                        rows={4}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          إضافة صور جديدة
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="w-full p-3 border-2 border-gray-200 rounded-lg"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setEditImages(files);
                          }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditQuestion(q.id)}
                          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
                        >
                           حفظ التعديلات
                        </button>
                        <button
                          onClick={() => {
                            setEditingQuestion(null);
                            setEditImages([]);
                          }}
                          className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-bold"
                        >
                           إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* عرض السؤال بثلاث لغات */}
                      <div className="mb-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            نص السؤال:
                          </p>
                        </div>
                        <div className="space-y-3">
                          {q.textNL && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs font-bold text-gray-600 mb-1">🇳🇱 Nederlands:</p>
                              <p className="text-sm text-gray-700">{q.textNL}</p>
                            </div>
                          )}
                          {q.textFR && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs font-bold text-gray-600 mb-1">🇫🇷 Français:</p>
                              <p className="text-sm text-gray-700">{q.textFR}</p>
                            </div>
                          )}
                          {q.textAR && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs font-bold text-gray-600 mb-1">🇸🇦 العربية:</p>
                              <p className="text-sm text-gray-700">{q.textAR}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {q.videoUrls && q.videoUrls.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 mb-3">الفيديوهات المرفقة:</p>
                          <div className="flex gap-3 flex-wrap">
                            {q.videoUrls.map((url, idx) => (
                              <div
                                key={idx}
                                className="relative group"
                              >
                                <video
                                  src={url}
                                  controls
                                  className="w-80 h-60 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <button
                                  onClick={() => handleDeleteImage(q.id, url)}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition font-bold shadow-lg hover:bg-red-600"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                  فيديو {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.audioUrl && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">الملف الصوتي:</p>
                          <audio controls className="w-full max-w-md">
                            <source src={q.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}

                      {/* عرض الشروحات */}
                      {(q.explanationNL || q.explanationFR || q.explanationAR) && (
                        <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            الشروحات:
                          </p>
                          <div className="space-y-3">
                            {q.explanationNL && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-600 mb-1">🇳🇱 Nederlands:</p>
                                <p className="text-sm text-gray-700">{q.explanationNL}</p>
                              </div>
                            )}
                            {q.explanationFR && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-600 mb-1">🇫🇷 Français:</p>
                                <p className="text-sm text-gray-700">{q.explanationFR}</p>
                              </div>
                            )}
                            {q.explanationAR && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-600 mb-1">🇸🇦 العربية:</p>
                                <p className="text-sm text-gray-700">{q.explanationAR}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* عرض الإجابات للامتحانات */}
                      {(q.answer1 || q.answer2 || q.answer3) && (
                        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            خيارات الإجابة:
                          </p>
                          <div className="space-y-2">
                            {q.answer1 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 1 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 1 ? '✓ ' : ''}الإجابة 1:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer1}</p>
                              </div>
                            )}
                            {q.answer2 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 2 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 2 ? '✓ ' : ''}الإجابة 2:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer2}</p>
                              </div>
                            )}
                            {q.answer3 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 3 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 3 ? '✓ ' : ''}الإجابة 3:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer3}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setEditText(q.text);
                          }}
                          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="صورة مكبرة"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}