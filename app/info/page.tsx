"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import Navbar from "@/components/Navbar";

export default function InfoPage() {
  const router = useRouter();
  const { lang } = useLang();
  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : "Retour"}
          </button>

          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {lang === "ar" 
              ? "معلومات عن رخصة القيادة البلجيكية" 
              : lang === "nl" 
              ? "Informatie om een Belgisch rijbewijs te verkrijgen" 
              : "Informations pour obtenir un permis de conduire belge"}
          </h1>
          <p className="text-gray-600">
            {lang === "ar" 
              ? "كل ما تحتاج معرفته للحصول على رخصة القيادة في بلجيكا" 
              : lang === "nl" 
              ? "Alles wat je moet weten om je rijbewijs in België te halen" 
              : "Tout ce que vous devez savoir pour obtenir votre permis en Belgique"}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">

          {/* Categories Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              {lang === "ar" ? "فئات رخصة القيادة" : lang === "nl" ? "Rijbewijscategorieën" : "Catégories de permis"}
            </h2>
            
            <div className="space-y-4">
              {/* Category A */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-orange-800 mb-3">
                  {lang === "ar" ? "الفئة A - الدراجات النارية" : lang === "nl" ? "Categorie A - Motorfietsen" : "Catégorie A - Motos"}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{lang === "ar" ? "الحد الأدنى للعمر: 18 سنة" : lang === "nl" ? "Minimumleeftijd: 18 jaar" : "Âge minimum: 18 ans"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{lang === "ar" ? "للدراجات النارية بجميع الأحجام" : lang === "nl" ? "Voor motorfietsen van alle cilinders" : "Pour motos de toutes cylindrées"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{lang === "ar" ? "يتطلب امتحان نظري وعملي" : lang === "nl" ? "Vereist theoretisch en praktisch examen" : "Nécessite examen théorique et pratique"}</span>
                  </li>
                </ul>
              </div>

              {/* Category B */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-3">
                  {lang === "ar" ? "الفئة B - السيارات" : lang === "nl" ? "Categorie B - Auto's" : "Catégorie B - Voitures"}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{lang === "ar" ? "الحد الأدنى للعمر: 18 سنة" : lang === "nl" ? "Minimumleeftijd: 18 jaar" : "Âge minimum: 18 ans"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{lang === "ar" ? "للسيارات حتى 3500 كجم" : lang === "nl" ? "Voor auto's tot 3500 kg" : "Pour voitures jusqu'à 3500 kg"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{lang === "ar" ? "حتى 8 مقاعد للركاب" : lang === "nl" ? "Tot 8 passagiersplaatsen" : "Jusqu'à 8 places passagers"}</span>
                  </li>
                </ul>
              </div>

              {/* Category C */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  {lang === "ar" ? "الفئة C - الشاحنات" : lang === "nl" ? "Categorie C - Vrachtwagens" : "Catégorie C - Camions"}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>{lang === "ar" ? "الحد الأدنى للعمر: 21 سنة" : lang === "nl" ? "Minimumleeftijd: 21 jaar" : "Âge minimum: 21 ans"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>{lang === "ar" ? "للشاحنات أكثر من 3500 كجم" : lang === "nl" ? "Voor vrachtwagens boven 3500 kg" : "Pour camions au-dessus de 3500 kg"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>{lang === "ar" ? "يتطلب رخصة B أولاً" : lang === "nl" ? "Vereist eerst rijbewijs B" : "Nécessite d'abord permis B"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              {lang === "ar" ? "خطوات الحصول على الرخصة" : lang === "nl" ? "Stappen om je rijbewijs te halen" : "Étapes pour obtenir le permis"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {lang === "ar" ? "التسجيل في مدرسة القيادة" : lang === "nl" ? "Inschrijven bij een rijschool" : "Inscription à une auto-école"}
                  </h3>
                  <p className="text-gray-600">
                    {lang === "ar" 
                      ? "اختر مدرسة قيادة معتمدة وسجل للحصول على دروس القيادة النظرية والعملية." 
                      : lang === "nl" 
                      ? "Kies een erkende rijschool en schrijf je in voor theoretische en praktische rijlessen." 
                      : "Choisissez une auto-école agréée et inscrivez-vous pour des cours théoriques et pratiques."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {lang === "ar" ? "الامتحان النظري" : lang === "nl" ? "Theoretisch examen" : "Examen théorique"}
                  </h3>
                  <p className="text-gray-600">
                    {lang === "ar" 
                      ? "اجتاز الامتحان النظري الذي يختبر معرفتك بقواعد المرور وإشارات الطريق." 
                      : lang === "nl" 
                      ? "Slaag voor het theoretisch examen dat je kennis van verkeersregels en verkeersborden test." 
                      : "Réussissez l'examen théorique qui teste vos connaissances du code de la route."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {lang === "ar" ? "دروس القيادة العملية" : lang === "nl" ? "Praktische rijlessen" : "Cours de conduite pratique"}
                  </h3>
                  <p className="text-gray-600">
                    {lang === "ar" 
                      ? "خذ دروس القيادة العملية مع مدرب معتمد لتعلم مهارات القيادة الآمنة." 
                      : lang === "nl" 
                      ? "Neem praktische rijlessen met een erkende instructeur om veilig rijden te leren." 
                      : "Prenez des cours pratiques avec un moniteur agréé pour apprendre à conduire en toute sécurité."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {lang === "ar" ? "الامتحان العملي" : lang === "nl" ? "Praktisch examen" : "Examen pratique"}
                  </h3>
                  <p className="text-gray-600">
                    {lang === "ar" 
                      ? "اجتاز الامتحان العملي لإثبات قدرتك على القيادة بأمان في ظروف مرورية حقيقية." 
                      : lang === "nl" 
                      ? "Slaag voor het praktisch examen om te bewijzen dat je veilig kunt rijden in echte verkeerssituaties." 
                      : "Réussissez l'examen pratique pour prouver que vous pouvez conduire en toute sécurité."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {lang === "ar" ? "احصل على رخصتك" : lang === "nl" ? "Ontvang je rijbewijs" : "Recevez votre permis"}
                  </h3>
                  <p className="text-gray-600">
                    {lang === "ar" 
                      ? "بعد النجاح في جميع الامتحانات، ستحصل على رخصة القيادة البلجيكية الخاصة بك!" 
                      : lang === "nl" 
                      ? "Na het slagen voor alle examens ontvang je je Belgisch rijbewijs!" 
                      : "Après avoir réussi tous les examens, vous recevrez votre permis de conduire belge!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              {lang === "ar" ? "المتطلبات الأساسية" : lang === "nl" ? "Basisvereisten" : "Exigences de base"}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {lang === "ar" ? "العمر" : lang === "nl" ? "Leeftijd" : "Âge"}
                </h3>
                <p className="text-gray-600">
                  {lang === "ar" 
                    ? "18 سنة للفئة A و B، 21 سنة للفئة C" 
                    : lang === "nl" 
                    ? "18 jaar voor categorie A en B, 21 jaar voor categorie C" 
                    : "18 ans pour catégorie A et B, 21 ans pour catégorie C"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {lang === "ar" ? "الوثائق" : lang === "nl" ? "Documenten" : "Documents"}
                </h3>
                <p className="text-gray-600">
                  {lang === "ar" 
                    ? "بطاقة الهوية، شهادة طبية، صور شخصية" 
                    : lang === "nl" 
                    ? "Identiteitskaart, medisch attest, pasfoto's" 
                    : "Carte d'identité, certificat médical, photos"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {lang === "ar" ? "التكلفة" : lang === "nl" ? "Kosten" : "Coût"}
                </h3>
                <p className="text-gray-600">
                  {lang === "ar" 
                    ? "تختلف حسب مدرسة القيادة والفئة" 
                    : lang === "nl" 
                    ? "Varieert per rijschool en categorie" 
                    : "Varie selon l'auto-école et la catégorie"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {lang === "ar" ? "المدة" : lang === "nl" ? "Duur" : "Durée"}
                </h3>
                <p className="text-gray-600">
                  {lang === "ar" 
                    ? "عادة 3-6 أشهر حسب التقدم" 
                    : lang === "nl" 
                    ? "Meestal 3-6 maanden afhankelijk van vooruitgang" 
                    : "Généralement 3-6 mois selon les progrès"}
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              {lang === "ar" ? "نصائح للنجاح" : lang === "nl" ? "Tips voor succes" : "Conseils pour réussir"}
            </h2>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{lang === "ar" ? "تدرب بانتظام على الأسئلة النظرية" : lang === "nl" ? "Oefen regelmatig met theorievragen" : "Pratiquez régulièrement les questions théoriques"}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{lang === "ar" ? "خذ دروس قيادة كافية قبل الامتحان" : lang === "nl" ? "Neem voldoende rijlessen voor het examen" : "Prenez suffisamment de cours avant l'examen"}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{lang === "ar" ? "ابق هادئاً ومركزاً أثناء الامتحان" : lang === "nl" ? "Blijf kalm en gefocust tijdens het examen" : "Restez calme et concentré pendant l'examen"}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{lang === "ar" ? "اسأل مدربك عن أي شيء غير واضح" : lang === "nl" ? "Vraag je instructeur over alles wat onduidelijk is" : "Demandez à votre moniteur tout ce qui n'est pas clair"}</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-xl hover:scale-105"
            >
              {lang === "ar" ? "ابدأ التعلم الآن" : lang === "nl" ? "Begin nu met leren" : "Commencez à apprendre maintenant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
