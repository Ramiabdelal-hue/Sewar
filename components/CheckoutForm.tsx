"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "@/context/LangContext";
import { FaQrcode, FaPaypal, FaCreditCard, FaLock, FaUser, FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export default function CheckoutForm({ selectedData, onBack, prefillData }: any) {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadySubscribedModal, setAlreadySubscribedModal] = useState(false);
  const [subscribedData, setSubscribedData] = useState<any>(null);
  const [registrationLocked, setRegistrationLocked] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ url: string; amount: number } | null>(null);
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    phone: "", paymentMethod: "bancontact",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("renewPrefillData");
    if (prefillData) {
      setFormData(f => ({ ...f, fullName: prefillData.fullName || "", email: prefillData.email || "", phone: prefillData.phone || "" }));
    } else if (storedData) {
      const p = JSON.parse(storedData);
      setFormData(f => ({ ...f, fullName: p.fullName || "", email: p.email || "", phone: p.phone || "" }));
    }
    fetch("/api/registration-status").then(r => r.json()).then(d => { if (d.locked) setRegistrationLocked(true); }).catch(() => {});
  }, [prefillData]);

  const redirectToContent = (data: any) => {
    const selectedCatId = selectedData?.catId || "B";
    const userCategory = data.cat || "B";
    localStorage.setItem("userEmail", data.email || formData.email);
    localStorage.setItem("userCategory", userCategory);
    localStorage.setItem("userExpiry", data.exp?.toString() || "");
    if (selectedCatId === "lessons") window.location.assign(`/praktical/lessons?email=${encodeURIComponent(data.email)}&exp=${data.exp}`);
    else if (selectedCatId === "exam") window.location.assign(`/praktical/exam?email=${encodeURIComponent(data.email)}&exp=${data.exp}`);
    else if (["cat-a","cat-b","cat-c"].includes(selectedCatId)) window.location.assign(`/examen?email=${encodeURIComponent(data.email)}&cat=${userCategory}&exp=${data.exp}`);
    else window.location.assign(`/lessons?cat=${userCategory}&email=${encodeURIComponent(data.email)}&exp=${data.exp}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(lang === "ar" ? "كلمات المرور غير متطابقة!" : lang === "nl" ? "Wachtwoorden komen niet overeen!" : lang === "fr" ? "Les mots de passe ne correspondent pas!" : "Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const selectedCatId = selectedData?.catId || "B";
      const duration = selectedData?.duration || "2w";
      let targetCat = "B";
      if (["cat-c","C"].includes(selectedCatId)) targetCat = "C";
      else if (["cat-a","A"].includes(selectedCatId)) targetCat = "A";
      let subscriptionType = "theorie";
      if (selectedCatId === "lessons") subscriptionType = "praktijk-lessons";
      else if (selectedCatId === "exam") subscriptionType = "praktijk-exam";
      else if (["cat-a","cat-b","cat-c"].includes(selectedCatId)) subscriptionType = "examen";

      // أسعار الاشتراكات
      const packagePrices: Record<string, Record<string, number>> = {
        theorie:           { "2w": 25, "1m": 50 },
        examen:            { "2w": 25, "1m": 50 },
        "praktijk-lessons":{ "2w": 49, "1m": 49 },
        "praktijk-exam":   { "2w": 39, "1m": 39 },
      };
      const amount = packagePrices[subscriptionType]?.[duration] ?? 25;

      localStorage.setItem("renewPrefillData", JSON.stringify({ fullName: formData.fullName, email: formData.email, phone: formData.phone }));

      // إنشاء دفعة Mollie
      const res = await fetch("/api/mollie/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: `Sewar Rijbewijs Online — ${subscriptionType} ${targetCat} (${duration})`,
          email: formData.email,
          metadata: {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            category: targetCat,
            subscriptionType,
            duration,
            paymentMethod: formData.paymentMethod,
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        if (formData.paymentMethod === "qr_scan") {
          // عرض QR code بدلاً من التوجيه
          setQrModal({ url: data.checkoutUrl, amount });
        } else {
          // توجيه المستخدم لصفحة دفع Mollie
          window.location.href = data.checkoutUrl;
        }
      } else if (data.alreadySubscribed) {
        alert(
          lang === "ar"
            ? `⚠️ لديك اشتراك نشط في هذه الفئة — متبقي ${data.daysLeft} يوم\n\nيمكنك الاشتراك في فئة أو خاصية مختلفة.`
            : lang === "nl"
            ? `⚠️ U heeft al een actief abonnement voor deze categorie — nog ${data.daysLeft} dagen geldig\n\nU kunt zich abonneren op een andere categorie of dienst.`
            : lang === "fr"
            ? `⚠️ Vous avez déjà un abonnement actif pour cette catégorie — encore ${data.daysLeft} jours\n\nVous pouvez vous abonner à une autre catégorie ou service.`
            : `⚠️ You already have an active subscription for this category — ${data.daysLeft} days remaining\n\nYou can subscribe to a different category or service.`
        );
      } else {
        alert(data.message || (lang === "ar" ? "خطأ في إنشاء الدفع" : "Betaling aanmaken mislukt"));
      }    } catch {
      alert(lang === "ar" ? "خطأ في الخادم!" : lang === "nl" ? "Serverfout!" : lang === "fr" ? "Erreur serveur!" : "Server error!");
    } finally {
      setLoading(false);
    }
  };

  const payMethods = [
    { id: "bancontact", label: "Bancontact", icon: <FaCreditCard />, color: "#6366f1", glow: "rgba(99,102,241,0.4)" },
    { id: "qr_scan",   label: "QR Code",    icon: <FaQrcode />,     color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    { id: "paypal",    label: "PayPal",      icon: <FaPaypal />,     color: "#22d3ee", glow: "rgba(34,211,238,0.4)" },
  ];

  const fields = [
    { key: "fullName",        type: "text",     icon: <FaUser />,     placeholder: lang === "ar" ? "محمد أحمد" : "Jan Janssen",          label: lang === "ar" ? "الاسم الكامل"          : lang === "nl" ? "Volledige naam"       : lang === "fr" ? "Nom complet"            : "Full name" },
    { key: "email",           type: "email",    icon: <FaEnvelope />, placeholder: lang === "ar" ? "example@email.com" : "jan@email.com", label: lang === "ar" ? "البريد الإلكتروني"    : lang === "nl" ? "E-mailadres"          : lang === "fr" ? "Adresse e-mail"         : "Email address" },
    { key: "password",        type: "password", icon: <FaLock />,     placeholder: "••••••••",                                            label: lang === "ar" ? "كلمة المرور"          : lang === "nl" ? "Wachtwoord"           : lang === "fr" ? "Mot de passe"           : "Password" },
    { key: "confirmPassword", type: "password", icon: <FaLock />,     placeholder: "••••••••",                                            label: lang === "ar" ? "تأكيد كلمة المرور"   : lang === "nl" ? "Bevestig wachtwoord"  : lang === "fr" ? "Confirmer le mot de passe" : "Confirm password" },
    { key: "phone",           type: "tel",      icon: <FaPhone />,    placeholder: "+32 4XX XX XX XX",                                    label: lang === "ar" ? "رقم الهاتف"           : lang === "nl" ? "Telefoonnummer"       : lang === "fr" ? "Numéro de téléphone"    : "Phone number" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:items-center md:justify-center py-0 md:py-8"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "#f0f0f0" }}>

      <div className="relative z-10 w-full md:max-w-lg flex-1 md:flex-none flex flex-col">
        <div className="flex-1 flex flex-col md:rounded-3xl md:overflow-hidden bg-white"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* Header */}
          <div className="px-5 md:px-6 pt-5 pb-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #f3f4f6", background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            <button onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
              {isRtl ? <FaChevronRight className="text-white text-sm" /> : <FaChevronLeft className="text-white text-sm" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                {lang === "ar" ? "إتمام الاشتراك" : lang === "nl" ? "Inschrijving voltooien" : lang === "fr" ? "Finaliser l'inscription" : "Complete registration"}
              </p>
              <h1 className="text-white font-black text-sm leading-tight truncate">{selectedData?.catName || "Rijbewijs"}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex gap-0.5 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                {[["nl","NL"],["fr","FR"],["ar","AR"],["en","EN"]].map(([code, label]) => (
                  <button key={code} type="button" onClick={() => setLang(code as any)}
                    className="px-2 py-1 rounded-md text-[10px] font-black transition-all"
                    style={lang === code ? { background: "rgba(255,255,255,0.25)", color: "white" } : { color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                {selectedData?.duration === "2w" ? "2W" : "1M"}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 pb-8 space-y-4">

            {/* بانر Test Mode */}
            <div className="px-4 py-3 rounded-xl text-center"
              style={{ background: "rgba(234,179,8,0.15)", border: "1.5px solid rgba(234,179,8,0.4)" }}>
              <p className="text-yellow-600 font-black text-xs">
                🧪 TEST MODE — {lang === "ar" ? "وضع الاختبار: التسجيل مجاني بدون دفع حقيقي" : lang === "nl" ? "Testmodus: gratis registratie zonder echte betaling" : lang === "fr" ? "Mode test: inscription gratuite sans vrai paiement" : "Test mode: free registration without real payment"}
              </p>
            </div>

            {/* رسالة القفل */}
            {registrationLocked && (
              <div className="px-5 py-4 rounded-2xl text-center"
                style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.2))", border: "1px solid rgba(249,115,22,0.3)" }}>
                <p className="text-orange-400 font-black text-sm">🔧 {lang === "ar" ? "الموقع تحت الصيانة" : lang === "nl" ? "Website in onderhoud" : "Under maintenance"}</p>
                <p className="text-orange-400/60 text-xs mt-1">{lang === "ar" ? "يرجى المحاولة لاحقاً 🙏" : lang === "nl" ? "Probeer het later opnieuw 🙏" : "Please try again later 🙏"}</p>
              </div>
            )}

            {/* رسالة النجاح */}
            {successMsg && (
              <div className="px-5 py-4 rounded-2xl text-center font-black text-sm"
                style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2))", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* حقول الإدخال */}
              <div className="space-y-3">
                {fields.map(({ key, type, icon, placeholder, label }) => {
                  const isFocused = focusedField === key;
                  return (
                    <div key={key}>
                      <label className="block text-[11px] font-black mb-1.5 px-1 uppercase tracking-wider"
                        style={{ color: isFocused ? "#7c3aed" : "#9ca3af" }}>
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-sm transition-colors"
                          style={{ [isRtl ? "right" : "left"]: "1rem", color: isFocused ? "#7c3aed" : "#9ca3af" }}>
                          {icon}
                        </span>
                        <input
                          required type={type} placeholder={placeholder}
                          value={(formData as any)[key] || ""}
                          className="w-full py-3.5 text-sm font-medium placeholder-gray-300 rounded-xl outline-none transition-all"
                          style={{
                            paddingLeft: isRtl ? "1rem" : "2.75rem",
                            paddingRight: isRtl ? "2.75rem" : "1rem",
                            background: isFocused ? "rgba(124,58,237,0.05)" : "#f9fafb",
                            border: isFocused ? "1.5px solid #7c3aed" : "1.5px solid #e5e7eb",
                            color: "#1a1a1a",
                          }}
                          onFocus={() => setFocusedField(key)}
                          onBlur={() => setFocusedField(null)}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* طريقة الدفع */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider mb-3 px-1" style={{ color: "#9ca3af" }}>
                  {t.paymentQuestion}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {payMethods.map(m => {
                    const active = formData.paymentMethod === m.id;
                    return (
                      <button key={m.id} type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                        className="relative flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95 hover:scale-[1.03]"
                        style={{
                          background: active ? "rgba(124,58,237,0.08)" : "#f9fafb",
                          border: active ? "1.5px solid #7c3aed" : "1.5px solid #e5e7eb",
                        }}>
                        {active && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ background: "#7c3aed" }} />
                        )}
                        <span className="text-xl transition-colors" style={{ color: active ? "#7c3aed" : "#9ca3af" }}>{m.icon}</span>
                        <span className="text-[10px] font-black transition-colors" style={{ color: active ? "#7c3aed" : "#9ca3af" }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* أمان */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <FaLock className="text-green-400/70 text-xs flex-shrink-0" />
                <p className="text-[11px] font-bold" style={{ color: "rgba(74,222,128,0.6)" }}>
                  {lang === "ar" ? "بياناتك محمية ومشفرة بالكامل" : lang === "nl" ? "Uw gegevens zijn beveiligd en versleuteld" : lang === "fr" ? "Vos données sont sécurisées et chiffrées" : "Your data is fully secured and encrypted"}
                </p>
              </div>

              {/* زر الإرسال */}
              <button type="submit" disabled={loading || registrationLocked}
                className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-40"
                style={{
                  background: loading ? "#e5e7eb" : "linear-gradient(135deg, #d4af37, #f0d060)",
                  color: loading ? "#9ca3af" : "#0a0a0a",
                  boxShadow: loading ? "none" : "0 8px 32px rgba(212,175,55,0.35)",
                }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white/60">{lang === "ar" ? "جاري التوجيه للدفع..." : lang === "nl" ? "Doorsturen naar betaling..." : lang === "fr" ? "Redirection vers paiement..." : "Redirecting to payment..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🔒 {lang === "ar" ? "ادفع الآن عبر Mollie" : lang === "nl" ? "Nu betalen via Mollie" : lang === "fr" ? "Payer maintenant via Mollie" : "Pay now via Mollie"}
                    {isRtl ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal - QR Code للدفع */}
      {qrModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white text-center"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <div className="text-4xl mb-2">📱</div>
              <h2 className="text-white font-black text-lg">
                {lang === "ar" ? "امسح للدفع" : lang === "nl" ? "Scan om te betalen" : lang === "fr" ? "Scanner pour payer" : "Scan to pay"}
              </h2>
              <p className="text-white/80 text-sm mt-1">€{qrModal.amount.toFixed(2)}</p>
            </div>

            {/* QR Code */}
            <div className="px-8 py-6 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
                <QRCodeSVG
                  value={qrModal.url}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-gray-500 text-xs font-medium text-center">
                {lang === "ar"
                  ? "امسح الكود بكاميرا هاتفك أو تطبيق الدفع"
                  : lang === "nl"
                  ? "Scan de code met uw telefoon of betaalapp"
                  : lang === "fr"
                  ? "Scannez le code avec votre téléphone ou app de paiement"
                  : "Scan the code with your phone or payment app"}
              </p>

              {/* زر فتح الرابط مباشرة */}
              <button
                onClick={() => window.location.href = qrModal.url}
                className="w-full py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {lang === "ar" ? "أو افتح رابط الدفع" : lang === "nl" ? "Of open betaallink" : lang === "fr" ? "Ou ouvrir le lien" : "Or open payment link"}
              </button>

              <button
                onClick={() => setQrModal(null)}
                className="w-full py-2.5 rounded-xl font-black text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50">
                {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : lang === "fr" ? "Annuler" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - اشتراك موجود */}
      {alreadySubscribedModal && subscribedData && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}>
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-black text-white mb-2">
                {lang === "ar" ? "🚫 اشتراك نشط موجود!" : lang === "nl" ? "🚫 Al een actief abonnement!" : lang === "fr" ? "🚫 Abonnement actif existant!" : "🚫 Active subscription exists!"}
              </h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                {lang === "ar" ? "هذا الإيميل لديه اشتراك نشط في نفس التصنيف." : lang === "nl" ? "Dit e-mailadres heeft al een actief abonnement voor dezelfde categorie." : lang === "fr" ? "Cet e-mail a déjà un abonnement actif pour la même catégorie." : "This email already has an active subscription for the same category."}
              </p>
              <div className="px-4 py-3 rounded-xl mb-4 text-start space-y-1.5"
                style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)" }}>
                <p className="text-orange-300 text-xs font-bold break-all">📧 {subscribedData.email}</p>
                {subscribedData.cat && <p className="text-orange-300 text-xs font-bold">📂 {lang === "ar" ? "التصنيف" : "Categorie"}: {subscribedData.cat}</p>}
                {subscribedData.daysLeft != null && (
                  <p className="text-orange-300 text-xs font-bold">
                    ⏳ {lang === "ar" ? `متبقي ${subscribedData.daysLeft} يوم` : lang === "nl" ? `Nog ${subscribedData.daysLeft} dagen geldig` : `${subscribedData.daysLeft} days remaining`}
                  </p>
                )}
              </div>
              <button onClick={() => { setAlreadySubscribedModal(false); setSubscribedData(null); }}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "white", boxShadow: "0 6px 24px rgba(139,92,246,0.35)" }}>
                {lang === "ar" ? "إغلاق" : lang === "nl" ? "Sluiten" : lang === "fr" ? "Fermer" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
