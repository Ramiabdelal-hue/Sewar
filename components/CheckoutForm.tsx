"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/context/LangContext";
import { FaQrcode, FaPaypal, FaCreditCard, FaLock } from "react-icons/fa";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import QRCode from "qrcode";

export default function CheckoutForm({ selectedData, onBack, prefillData }: any) {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadySubscribedModal, setAlreadySubscribedModal] = useState(false);
  const [subscribedData, setSubscribedData] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState(""); // صورة QR Code
  const [pendingPayment, setPendingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    paymentMethod: "bancontact",
  });

  // جلب البيانات القديمة تلقائيًا من localStorage إذا لم يتم تمريرها
  useEffect(() => {
    const storedData = localStorage.getItem("renewPrefillData");
    if (prefillData) {
      setFormData({
        fullName: prefillData.fullName || "",
        email: prefillData.email || "",
        password: "",
        confirmPassword: "",
        phone: prefillData.phone || "",
        paymentMethod: "bancontact",
      });
    } else if (storedData) {
      const parsed = JSON.parse(storedData);
      setFormData({
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        password: "",
        confirmPassword: "",
        phone: parsed.phone || "",
        paymentMethod: "bancontact",
      });
    }
  }, [prefillData]);

  const redirectToContent = (data: any) => {
    const selectedCatId = selectedData?.catId || "B";
    
    // تحديد الفئة الصحيحة من البيانات المرجعة
    const userCategory = data.cat || "B";
    
    // ✅ حفظ في localStorage
    localStorage.setItem("userEmail", data.email || formData.email);
    localStorage.setItem("userCategory", userCategory);
    localStorage.setItem("userExpiry", data.exp?.toString() || "");
    
    console.log("✅ User data saved to localStorage:", {
      email: data.email,
      category: userCategory,
      expiry: data.exp
    });
    
    // التحقق من نوع الاختيار (praktical أو theorie أو examen)
    if (selectedCatId === "lessons" || selectedCatId === "exam") {
      window.location.assign(
        `/praktical/${selectedCatId}?email=${encodeURIComponent(data.email)}&exp=${data.exp}`
      );
    } else if (selectedCatId === "cat-a" || selectedCatId === "cat-b" || selectedCatId === "cat-c" || selectedCatId === "A" || selectedCatId === "B" || selectedCatId === "C") {
      // للامتحانات أو الفئات المباشرة، استخدم الفئة الصحيحة
      window.location.assign(
        `/lessons?cat=${userCategory}&email=${encodeURIComponent(data.email)}&exp=${data.exp}`
      );
    } else {
      window.location.assign(
        `/lessons?cat=${userCategory}&email=${encodeURIComponent(data.email)}&exp=${data.exp}`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(lang === "ar" ? "كلمات المرور غير متطابقة!" : "Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const selectedCatId = selectedData?.catId || "B";
      const duration = selectedData?.duration || "2w";

      // تحديد الفئة بناءً على الاختيار
      let targetCat = "B"; // القيمة الافتراضية
      if (selectedCatId === "cat-c" || selectedCatId === "C") targetCat = "C";
      else if (selectedCatId === "cat-a" || selectedCatId === "A") targetCat = "A";
      else if (selectedCatId === "cat-b" || selectedCatId === "B") targetCat = "B";
      
      console.log("📋 Selected category:", selectedCatId, "→ Target category:", targetCat);

      // تحديد نوع الاشتراك
      let subscriptionType = "theorie";
      if (selectedCatId === "lessons") {
        subscriptionType = "praktijk-lessons";
      } else if (selectedCatId === "exam") {
        subscriptionType = "praktijk-exam";
      } else if (selectedCatId === "cat-a" || selectedCatId === "cat-b" || selectedCatId === "cat-c") {
        subscriptionType = "examen";
      }

      const expiryDate = new Date();
      duration === "2w"
        ? expiryDate.setDate(expiryDate.getDate() + 14)
        : expiryDate.setMonth(expiryDate.getMonth() + 1);
      const expiryTimestamp = expiryDate.getTime();

      // ⚠️ لا نحفظ في localStorage هنا - فقط بعد تأكيد الدفع
      // حفظ البيانات للتجديد فقط
      localStorage.setItem("renewPrefillData", JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }));

      const requestBody = {
        ...formData,
        category: targetCat,
        subscriptionType: subscriptionType,
        expiry: expiryTimestamp,
        forceRenew: prefillData ? true : false,
      };

      console.log("📤 Sending to API:", requestBody);

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log("📥 API Response:", data);

      if (data.success) {
        // ✅ للتجربة: حفظ البيانات مباشرة والدخول
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userCategory", data.cat || selectedData?.catId);
        localStorage.setItem("userExpiry", data.exp?.toString() || "");
        
        setSuccessMsg(
          lang === "ar"
            ? "🎉 تم التسجيل بنجاح! جاري الدخول..."
            : lang === "nl"
            ? "🎉 Registratie succesvol! Inloggen..."
            : "🎉 Inscription réussie! Connexion..."
        );
        
        setTimeout(() => {
          redirectToContent(data);
        }, 1500);
        
      } else {
        // التحقق إذا كان المستخدم مشترك بالفعل
        console.log("Checking alreadySubscribed:", data.alreadySubscribed);
        if (data.alreadySubscribed) {
          console.log("Setting modal to true");
          setSubscribedData(data);
          setAlreadySubscribedModal(true);
        } else {
          alert(data.message || (lang === "ar" ? "حدث خطأ" : lang === "nl" ? "Er is een fout opgetreden" : "Une erreur s'est produite"));
        }
      }
    } catch (error) {
      console.error(error);
      alert(lang === "ar" ? "خطأ في الخادم!" : "Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-12 px-4 md:px-6 flex items-center justify-center"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <FaQrcode className="text-4xl text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              {lang === "ar" ? "امسح رمز QR للدفع" : lang === "nl" ? "Scan QR-code om te betalen" : "Scannez le QR code pour payer"}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {lang === "ar" 
                ? "استخدم تطبيق البنك لمسح الكود والدفع" 
                : lang === "nl" 
                ? "Gebruik je bank-app om de code te scannen en te betalen" 
                : "Utilisez votre app bancaire pour scanner et payer"}
            </p>
            
            <div className="bg-white p-6 rounded-2xl border-4 border-orange-500 mb-6 shadow-lg">
              {qrCodeImage ? (
                <img 
                  src={qrCodeImage} 
                  alt="QR Code" 
                  className="w-full h-auto mx-auto rounded-xl"
                />
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <FaQrcode className="text-8xl text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-gray-600 font-bold">
                      {lang === "ar" ? "جاري إنشاء QR Code..." : lang === "nl" ? "QR-code wordt gemaakt..." : "Création du QR code..."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {pendingPayment && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-gray-600 font-medium">
                  {lang === "ar" ? "في انتظار الدفع..." : lang === "nl" ? "Wachten op betaling..." : "En attente de paiement..."}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {lang === "ar" ? "سيتم التحديث تلقائياً بعد الدفع" : lang === "nl" ? "Wordt automatisch bijgewerkt na betaling" : "Sera mis à jour automatiquement après paiement"}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowQRCode(false);
                setPendingPayment(false);
              }}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : "Annuler"}
            </button>
          </div>
        </div>
      )}

      {/* Payment Info Modal */}
      {pendingPayment && !showQRCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <FaCreditCard className="text-4xl text-white animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
              {lang === "ar" ? "في انتظار الدفع" : lang === "nl" ? "Wachten op betaling" : "En attente de paiement"}
            </h2>
            
            <div className="mb-6 text-center bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-blue-700 font-bold text-lg mb-2">
                {lang === "ar" ? "يرجى إكمال الدفع في التطبيق" : lang === "nl" ? "Voltooi de betaling in de app" : "Complétez le paiement dans l'app"}
              </p>
              <p className="text-xs text-blue-600">
                {lang === "ar" ? "سيتم التحديث تلقائياً عند استلام الدفع" : lang === "nl" ? "Wordt automatisch bijgewerkt bij ontvangst" : "Sera mis à jour automatiquement à réception"}
              </p>
            </div>

            <button
              onClick={() => {
                setPendingPayment(false);
                setSuccessMsg("");
              }}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : "Annuler"}
            </button>
          </div>
        </div>
      )}

      {/* Payment Info Modal - OLD (not used anymore) */}
      {paymentInfo && false && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <FaCreditCard className="text-4xl text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
              {lang === "ar" ? "إكمال الدفع" : lang === "nl" ? "Betaling voltooien" : "Compléter le paiement"}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {lang === "ar" ? "طريقة الدفع" : lang === "nl" ? "Betaalmethode" : "Méthode de paiement"}
                </p>
                <p className="text-xl font-black text-blue-600">{paymentInfo.method}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {lang === "ar" ? "المبلغ" : lang === "nl" ? "Bedrag" : "Montant"}
                </p>
                <p className="text-2xl font-black text-green-600">{paymentInfo.amount}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {lang === "ar" ? "رقم المرجع" : lang === "nl" ? "Referentienummer" : "Numéro de référence"}
                </p>
                <p className="text-sm font-bold text-gray-700 font-mono">{paymentInfo.reference}</p>
              </div>
            </div>

            {/* زر فتح تطبيق Bancontact */}
            {paymentInfo.method === "Bancontact" && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    // محاولة فتح تطبيق Bancontact
                    window.location.href = `bancontact://payment?amount=${paymentInfo.amount.replace('€', '')}&reference=${paymentInfo.reference}`;
                    
                    // إذا لم يعمل، فتح الموقع
                    setTimeout(() => {
                      window.open('https://www.bancontact.com/nl', '_blank');
                    }, 1000);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 mb-3"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaCreditCard className="text-2xl" />
                    <span>{lang === "ar" ? "فتح تطبيق Bancontact" : lang === "nl" ? "Open Bancontact app" : "Ouvrir l'app Bancontact"}</span>
                  </div>
                </button>
                <p className="text-xs text-gray-500 text-center mb-4">
                  {lang === "ar" ? "سيتم فتح تطبيق Bancontact لإكمال الدفع" : lang === "nl" ? "De Bancontact app wordt geopend om de betaling te voltooien" : "L'application Bancontact s'ouvrira pour compléter le paiement"}
                </p>
              </div>
            )}

            {/* زر فتح PayPal */}
            {paymentInfo.method === "PayPal" && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    window.open(`https://www.paypal.com/paypalme/drivingschool/${paymentInfo.amount.replace('€', '')}`, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 mb-3"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaPaypal className="text-2xl" />
                    <span>{lang === "ar" ? "فتح PayPal" : lang === "nl" ? "Open PayPal" : "Ouvrir PayPal"}</span>
                  </div>
                </button>
                <p className="text-xs text-gray-500 text-center mb-4">
                  {lang === "ar" ? "سيتم فتح PayPal لإكمال الدفع" : lang === "nl" ? "PayPal wordt geopend om de betaling te voltooien" : "PayPal s'ouvrira pour compléter le paiement"}
                </p>
              </div>
            )}

            {pendingPayment && (
              <div className="mb-6 text-center bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-blue-700 font-bold">
                  {lang === "ar" ? "في انتظار تأكيد الدفع..." : lang === "nl" ? "Wachten op bevestiging..." : "En attente de confirmation..."}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  {lang === "ar" ? "سيتم التحديث تلقائياً عند استلام الدفع" : lang === "nl" ? "Wordt automatisch bijgewerkt bij ontvangst" : "Sera mis à jour automatiquement à réception"}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setPaymentInfo(null);
                setPendingPayment(false);
              }}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : "Annuler"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-gray-100 relative">
        {successMsg && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-xl animate-fadeIn text-center font-bold z-50">
            {successMsg}
          </div>
        )}

        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:text-blue-700 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.backToPlans}
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.checkoutTitle}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t.checkoutSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t.fullNamePlaceholder}
              </label>
              <input
                required
                value={formData.fullName}
                placeholder={t.fullNamePlaceholder}
                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all"
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t.emailPlaceholder}
              </label>
              <input
                required
                type="email"
                value={formData.email}
                placeholder={t.emailPlaceholder}
                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="password"
                    placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
                    className="w-full p-4 pl-12 rounded-xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="password"
                    placeholder={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                    className="w-full p-4 pl-12 rounded-xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t.phonePlaceholder}
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                placeholder={t.phonePlaceholder}
                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 outline-none focus:border-blue-500 focus:bg-white transition-all"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-100">
            <label className="block mb-5 font-black text-gray-800 text-lg">{t.paymentQuestion}</label>
            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, paymentMethod: "bancontact" })}
                className={`group flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  formData.paymentMethod === "bancontact" 
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <FaCreditCard className={`text-3xl mb-3 transition-colors ${
                  formData.paymentMethod === "bancontact" ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                }`} />
                <span className={`text-xs font-bold uppercase ${
                  formData.paymentMethod === "bancontact" ? "text-blue-600" : "text-gray-500"
                }`}>Bancontact</span>
              </button>

              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, paymentMethod: "qr_scan" })}
                className={`group flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  formData.paymentMethod === "qr_scan" 
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                <FaQrcode className={`text-3xl mb-3 transition-colors ${
                  formData.paymentMethod === "qr_scan" ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"
                }`} />
                <span className={`text-xs font-bold uppercase ${
                  formData.paymentMethod === "qr_scan" ? "text-orange-600" : "text-gray-500"
                }`}>QR Code</span>
              </button>

              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, paymentMethod: "paypal" })}
                className={`group flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  formData.paymentMethod === "paypal" 
                    ? "border-[#0070ba] bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <FaPaypal className={`text-3xl mb-3 transition-colors ${
                  formData.paymentMethod === "paypal" ? "text-[#0070ba]" : "text-gray-400 group-hover:text-[#0070ba]"
                }`} />
                <span className={`text-xs font-bold uppercase ${
                  formData.paymentMethod === "paypal" ? "text-[#0070ba]" : "text-gray-500"
                }`}>PayPal</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-xl font-black text-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{lang === "ar" ? "جاري المعالجة..." : lang === "nl" ? "Verwerken..." : "Traitement..."}</span>
              </div>
            ) : (
              t.submitOrder
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>

      {/* Modal للمستخدم المشترك بالفعل */}
      {alreadySubscribedModal && subscribedData && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          style={{ zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[25px] sm:rounded-[35px] shadow-2xl overflow-hidden relative animate-fadeIn">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 px-2">
                {lang === "ar" ? "أنت مشترك بالفعل!" : lang === "nl" ? "Je bent al geabonneerd!" : "Vous êtes déjà abonné!"}
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-gray-700 text-center mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed px-2">
                {lang === "ar" 
                  ? "لديك اشتراك نشط بالفعل. لا يمكنك الاشتراك مرة أخرى حتى ينتهي اشتراكك الحالي."
                  : lang === "nl"
                  ? "Je hebt al een actief abonnement. Je kunt niet opnieuw inschrijven totdat je huidige abonnement is verlopen."
                  : "Vous avez déjà un abonnement actif. Vous ne pouvez pas vous réinscrire tant que votre abonnement actuel n'a pas expiré."}
              </p>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 text-center break-all">
                  <span className="font-bold text-orange-600">
                    {lang === "ar" ? "البريد الإلكتروني:" : lang === "nl" ? "E-mail:" : "E-mail:"}
                  </span>
                  <br />
                  {subscribedData.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setAlreadySubscribedModal(false);
                  setSubscribedData(null);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition active:scale-95"
              >
                {lang === "ar" ? "إغلاق" : lang === "nl" ? "Sluiten" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
