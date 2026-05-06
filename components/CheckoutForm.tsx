"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "@/context/LangContext";
import { FaQrcode, FaCreditCard, FaLock, FaUser, FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from "react-icons/fa";
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
  const [alreadySubscribedModal, setAlreadySubscribedModal] = useState(false);
  const [subscribedData, setSubscribedData] = useState<any>(null);
  const [registrationLocked, setRegistrationLocked] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ url: string; amount: number } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    phone: "", paymentMethod: "bancontact",
  });

  // حساب السعر
  const selectedCatId = selectedData?.catId || "B";
  const duration = selectedData?.duration || "2w";
  let subscriptionType = "theorie";
  if (selectedCatId === "lessons") subscriptionType = "praktijk-lessons";
  else if (selectedCatId === "exam") subscriptionType = "praktijk-exam";
  else if (["cat-a","cat-b","cat-c"].includes(selectedCatId)) subscriptionType = "examen";
  // ترجمة اسم الفئة حسب اللغة
  const catNames: Record<string, Record<string, string>> = {
    ar: { A: "الفئة A", B: "الفئة B", C: "الفئة C" },
    nl: { A: "Categorie A", B: "Categorie B", C: "Categorie C" },
    fr: { A: "Catégorie A", B: "Catégorie B", C: "Catégorie C" },
    en: { A: "Category A", B: "Category B", C: "Category C" },
  };
  const catLetter = selectedCatId === "cat-a" ? "A" : selectedCatId === "cat-c" ? "C" : selectedCatId === "cat-b" ? "B" : selectedCatId.toUpperCase().slice(-1);
  const translatedCatName = catNames[lang]?.[catLetter] || selectedData?.catName || "Rijbewijs";
  const packagePrices: Record<string, Record<string, number>> = {
    theorie:            { "2w": 25, "1m": 50 },
    examen:             { "2w": 25, "1m": 50 },
    "praktijk-lessons": { "2w": 49, "1m": 49 },
    "praktijk-exam":    { "2w": 39, "1m": 39 },
  };
  const amount = packagePrices[subscriptionType]?.[duration] ?? 25;
  const BTW = Math.round(amount * 0.21 * 100) / 100;
  const excl = Math.round((amount - BTW) * 100) / 100;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(lang === "ar" ? "كلمات المرور غير متطابقة!" : lang === "nl" ? "Wachtwoorden komen niet overeen!" : lang === "fr" ? "Les mots de passe ne correspondent pas!" : "Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      let targetCat = "B";
      if (["cat-c","C"].includes(selectedCatId)) targetCat = "C";
      else if (["cat-a","A"].includes(selectedCatId)) targetCat = "A";

      localStorage.setItem("renewPrefillData", JSON.stringify({ fullName: formData.fullName, email: formData.email, phone: formData.phone }));

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
          setQrModal({ url: data.checkoutUrl, amount });
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else if (data.alreadySubscribed) {
        setSubscribedData(data);
        setAlreadySubscribedModal(true);
      } else {
        alert(data.message || (lang === "ar" ? "خطأ في إنشاء الدفع" : "Betaling aanmaken mislukt"));
      }
    } catch {
      alert(lang === "ar" ? "خطأ في الخادم!" : lang === "nl" ? "Serverfout!" : lang === "fr" ? "Erreur serveur!" : "Server error!");
    } finally {
      setLoading(false);
    }
  };

  const payMethods = [
    {
      id: "bancontact",
      label: "Bancontact",
      sub: lang === "ar" ? "الدفع البلجيكي" : lang === "nl" ? "Belgische betaling" : lang === "fr" ? "Paiement belge" : "Belgian payment",
      icon: (
        <svg viewBox="0 0 56 32" className="w-12 h-7">
          <rect width="56" height="32" rx="5" fill="#005498"/>
          <text x="28" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="Arial">BANC</text>
          <text x="28" y="25" textAnchor="middle" fill="#f5a623" fontSize="6" fontWeight="700" fontFamily="Arial">CONTACT</text>
        </svg>
      ),
      activeBorder: "#005498",
      activeBg: "rgba(0,84,152,0.12)",
      bg: "rgba(0,84,152,0.06)",
      border: "rgba(0,84,152,0.25)",
    },
    {
      id: "creditcard",
      label: "Visa / Mastercard",
      sub: lang === "ar" ? "بطاقة ائتمان" : lang === "nl" ? "Kredietkaart" : lang === "fr" ? "Carte de crédit" : "Credit card",
      icon: (
        <div className="flex gap-1 items-center">
          <svg viewBox="0 0 38 24" className="w-9 h-6">
            <rect width="38" height="24" rx="4" fill="#1a1f71"/>
            <text x="19" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="Arial" fontStyle="italic">VISA</text>
          </svg>
          <svg viewBox="0 0 38 24" className="w-9 h-6">
            <rect width="38" height="24" rx="4" fill="#252525"/>
            <circle cx="15" cy="12" r="7" fill="#eb001b"/>
            <circle cx="23" cy="12" r="7" fill="#f79e1b"/>
            <path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#ff5f00"/>
          </svg>
        </div>
      ),
      activeBorder: "#4f46e5",
      activeBg: "rgba(79,70,229,0.12)",
      bg: "rgba(79,70,229,0.06)",
      border: "rgba(79,70,229,0.25)",
    },
    {
      id: "qr_scan",
      label: "QR Code",
      sub: lang === "ar" ? "امسح للدفع" : lang === "nl" ? "Scan om te betalen" : lang === "fr" ? "Scanner pour payer" : "Scan to pay",
      icon: (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="#f59e0b" strokeWidth="2"/>
          <rect x="5" y="5" width="6" height="6" fill="#f59e0b"/>
          <rect x="18" y="2" width="12" height="12" rx="2" stroke="#f59e0b" strokeWidth="2"/>
          <rect x="21" y="5" width="6" height="6" fill="#f59e0b"/>
          <rect x="2" y="18" width="12" height="12" rx="2" stroke="#f59e0b" strokeWidth="2"/>
          <rect x="5" y="21" width="6" height="6" fill="#f59e0b"/>
          <rect x="18" y="18" width="4" height="4" fill="#f59e0b"/>
          <rect x="26" y="18" width="4" height="4" fill="#f59e0b"/>
          <rect x="18" y="26" width="4" height="4" fill="#f59e0b"/>
          <rect x="26" y="26" width="4" height="4" fill="#f59e0b"/>
        </svg>
      ),
      activeBorder: "#f59e0b",
      activeBg: "rgba(245,158,11,0.12)",
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.25)",
    },
  ];

  const fields = [
    { key: "fullName",        type: "text",  icon: <FaUser />,     placeholder: lang === "ar" ? "محمد أحمد" : "Jan Janssen",  label: lang === "ar" ? "الاسم الكامل" : lang === "nl" ? "Volledige naam" : lang === "fr" ? "Nom complet" : "Full name" },
    { key: "email",           type: "email", icon: <FaEnvelope />, placeholder: "example@email.com",                           label: lang === "ar" ? "البريد الإلكتروني" : lang === "nl" ? "E-mailadres" : lang === "fr" ? "Adresse e-mail" : "Email" },
    { key: "phone",           type: "tel",   icon: <FaPhone />,    placeholder: "+32 4XX XX XX XX",                            label: lang === "ar" ? "رقم الهاتف" : lang === "nl" ? "Telefoonnummer" : lang === "fr" ? "Téléphone" : "Phone" },
    { key: "password",        type: showPass ? "text" : "password",        icon: <FaLock />, placeholder: "••••••••", label: lang === "ar" ? "كلمة المرور" : lang === "nl" ? "Wachtwoord" : lang === "fr" ? "Mot de passe" : "Password",         toggle: () => setShowPass(p => !p),        showToggle: showPass },
    { key: "confirmPassword", type: showConfirmPass ? "text" : "password", icon: <FaLock />, placeholder: "••••••••", label: lang === "ar" ? "تأكيد كلمة المرور" : lang === "nl" ? "Bevestig wachtwoord" : lang === "fr" ? "Confirmer" : "Confirm", toggle: () => setShowConfirmPass(p => !p), showToggle: showConfirmPass },
  ];

  return (
    <div className="min-h-screen" dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "#f0f0f0" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-gray-800 transition-colors">
            {isRtl ? <FaChevronRight /> : <FaChevronLeft />}
            {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
          </button>
          <div className="flex gap-1">
            {[["nl","NL"],["fr","FR"],["ar","AR"],["en","EN"]].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code as any)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                style={lang === code
                  ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "white" }
                  : { background: "#f3f4f6", color: "#6b7280" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">

        {/* ملخص الطلب */}
        <div className="rounded-2xl p-5 mb-6 bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              {lang === "ar" ? "ملخص الطلب" : lang === "nl" ? "Besteloverzicht" : lang === "fr" ? "Récapitulatif" : "Order summary"}
            </p>
            <span className="px-2.5 py-1 rounded-full text-xs font-black"
              style={{ background: "rgba(212,175,55,0.15)", color: "#92400e", border: "1px solid rgba(212,175,55,0.3)" }}>
              {duration === "2w" ? (lang === "ar" ? "أسبوعان" : lang === "nl" ? "2 Weken" : lang === "fr" ? "2 Semaines" : "2 Weeks") : (lang === "ar" ? "شهر" : lang === "nl" ? "1 Maand" : lang === "fr" ? "1 Mois" : "1 Month")}
            </span>
          </div>
          <p className="text-gray-900 font-black text-lg mb-3">{translatedCatName}</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{lang === "ar" ? "المبلغ بدون ضريبة" : "Excl. BTW"}</span>
              <span className="text-gray-700 font-bold">€{excl.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">BTW 21%</span>
              <span className="text-gray-700 font-bold">€{BTW.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-black">{lang === "ar" ? "الإجمالي" : lang === "nl" ? "Totaal" : lang === "fr" ? "Total" : "Total"}</span>
              <span className="font-black text-xl" style={{ color: "#d4af37" }}>€{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {registrationLocked && (
          <div className="px-4 py-3 rounded-xl mb-4 text-center bg-orange-50 border border-orange-200">
            <p className="text-orange-600 font-black text-sm">🔧 {lang === "ar" ? "الموقع تحت الصيانة" : lang === "nl" ? "Website in onderhoud" : "Under maintenance"}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* حقول الإدخال */}
          <div className="space-y-3">
            {fields.map(({ key, type, icon, placeholder, label, toggle, showToggle }: any) => {
              const isFocused = focusedField === key;
              return (
                <div key={key}>
                  <label className="block text-xs font-black mb-1.5 px-1 uppercase tracking-wider"
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
                      className="w-full py-3.5 text-sm font-medium rounded-xl outline-none transition-all"
                      style={{
                        paddingLeft: isRtl ? (toggle ? "3rem" : "1rem") : "2.75rem",
                        paddingRight: isRtl ? "2.75rem" : (toggle ? "3rem" : "1rem"),
                        background: isFocused ? "rgba(124,58,237,0.04)" : "#f9fafb",
                        border: isFocused ? "1.5px solid #7c3aed" : "1.5px solid #e5e7eb",
                        color: "#1a1a1a",
                      }}
                      onFocus={() => setFocusedField(key)}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    />
                    {toggle && (
                      <button type="button" onClick={toggle}
                        className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        style={{ [isRtl ? "left" : "right"]: "1rem" }}>
                        {showToggle ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* طريقة الدفع */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3 px-1 text-gray-400">
              🔒 {lang === "ar" ? "طريقة الدفع" : lang === "nl" ? "Betaalmethode" : lang === "fr" ? "Mode de paiement" : "Payment method"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {payMethods.map(m => {
                const active = formData.paymentMethod === m.id;
                return (
                  <button key={m.id} type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                    className="flex flex-col items-center gap-2 px-2 py-3.5 rounded-2xl transition-all active:scale-[0.98] bg-white"
                    style={{
                      border: `1.5px solid ${active ? m.activeBorder : "#e5e7eb"}`,
                      boxShadow: active ? `0 4px 16px ${m.activeBorder}22` : "0 1px 4px rgba(0,0,0,0.04)",
                      background: active ? m.activeBg : "white",
                    }}>
                    <div className="flex-shrink-0">{m.icon}</div>
                    <div className="text-center">
                      <p className="text-gray-900 font-black text-xs">{m.label}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5 leading-tight">{m.sub}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: active ? m.activeBorder : "transparent",
                        border: `2px solid ${active ? m.activeBorder : "#d1d5db"}`,
                      }}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* أمان */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-100">
            <FaLock className="text-green-500 flex-shrink-0" size={12} />
            <p className="text-green-700 text-xs font-bold">
              {lang === "ar" ? "دفع آمن ومشفر عبر Mollie · فاتورة على بريدك الإلكتروني" : lang === "nl" ? "Veilig & versleuteld via Mollie · Factuur per e-mail" : lang === "fr" ? "Paiement sécurisé via Mollie · Facture par e-mail" : "Secure payment via Mollie · Invoice by email"}
            </p>
          </div>

          {/* زر الدفع */}
          <button type="submit" disabled={loading || registrationLocked}
            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: loading ? "#e5e7eb" : "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)",
              color: loading ? "#9ca3af" : "#0a0a0a",
              boxShadow: loading ? "none" : "0 8px 32px rgba(212,175,55,0.35)",
            }}>
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span className="text-gray-500">{lang === "ar" ? "جاري التوجيه للدفع..." : lang === "nl" ? "Doorsturen naar betaling..." : lang === "fr" ? "Redirection..." : "Redirecting..."}</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🔒 {lang === "ar" ? `ادفع الآن — €${amount}` : lang === "nl" ? `Nu betalen — €${amount}` : lang === "fr" ? `Payer — €${amount}` : `Pay now — €${amount}`}
                {isRtl ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white text-center">
            <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <div className="text-4xl mb-2">📱</div>
              <h2 className="text-white font-black text-lg">{lang === "ar" ? "امسح للدفع" : lang === "nl" ? "Scan om te betalen" : lang === "fr" ? "Scanner pour payer" : "Scan to pay"}</h2>
              <p className="text-white/80 text-sm mt-1">€{qrModal.amount.toFixed(2)}</p>
            </div>
            <div className="px-8 py-6 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
                <QRCodeSVG value={qrModal.url} size={200} level="H" includeMargin={false} />
              </div>
              <p className="text-gray-500 text-xs text-center">
                {lang === "ar" ? "امسح بكاميرا هاتفك أو تطبيق الدفع" : lang === "nl" ? "Scan met uw telefoon of betaalapp" : lang === "fr" ? "Scannez avec votre téléphone ou app de paiement" : "Scan with your phone or payment app"}
              </p>
              <button onClick={() => window.location.href = qrModal.url}
                className="w-full py-3 rounded-xl font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {lang === "ar" ? "أو افتح رابط الدفع" : lang === "nl" ? "Of open betaallink" : lang === "fr" ? "Ou ouvrir le lien" : "Or open payment link"}
              </button>
              <button onClick={() => setQrModal(null)}
                className="w-full py-2.5 rounded-xl font-black text-sm border-2 border-gray-200 text-gray-500">
                {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : lang === "fr" ? "Annuler" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal اشتراك موجود */}
      {alreadySubscribedModal && subscribedData && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl bg-orange-50 border border-orange-200">⚠️</div>
              <h2 className="text-gray-900 font-black text-lg mb-2">
                {lang === "ar" ? "اشتراك نشط موجود!" : lang === "nl" ? "Al een actief abonnement!" : lang === "fr" ? "Abonnement actif existant!" : "Active subscription exists!"}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {lang === "ar" ? "لديك اشتراك نشط في هذه الفئة." : lang === "nl" ? "U heeft al een actief abonnement voor deze categorie." : lang === "fr" ? "Vous avez déjà un abonnement actif pour cette catégorie." : "You already have an active subscription."}
              </p>
              {subscribedData.daysLeft != null && (
                <p className="text-orange-500 font-black text-sm mb-4">
                  ⏳ {lang === "ar" ? `متبقي ${subscribedData.daysLeft} يوم` : lang === "nl" ? `Nog ${subscribedData.daysLeft} dagen geldig` : lang === "fr" ? `Encore ${subscribedData.daysLeft} jours` : `${subscribedData.daysLeft} days remaining`}
                </p>
              )}
              <button onClick={() => { setAlreadySubscribedModal(false); setSubscribedData(null); }}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                {lang === "ar" ? "إغلاق" : lang === "nl" ? "Sluiten" : lang === "fr" ? "Fermer" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
