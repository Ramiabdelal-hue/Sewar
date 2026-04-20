"use client";

import { useState, useEffect } from "react";
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
      const expiryDate = new Date();
      duration === "2w" ? expiryDate.setDate(expiryDate.getDate() + 14) : expiryDate.setMonth(expiryDate.getMonth() + 1);
      localStorage.setItem("renewPrefillData", JSON.stringify({ fullName: formData.fullName, email: formData.email, phone: formData.phone }));
      const res = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, category: targetCat, subscriptionType, expiry: expiryDate.getTime(), forceRenew: prefillData ? true : false }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userCategory", data.cat || selectedData?.catId);
        localStorage.setItem("userExpiry", data.exp?.toString() || "");
        setSuccessMsg(lang === "ar" ? "🎉 تم التسجيل بنجاح!" : lang === "nl" ? "🎉 Registratie succesvol!" : "🎉 Inscription réussie!");
        setTimeout(() => redirectToContent(data), 1500);
      } else {
        if (data.locked) {
          alert(lang === "ar" ? "⏳ الموقع تحت الصيانة\n\nنعمل على تحسين الموقع. يرجى المحاولة لاحقاً.\n\nشكراً لصبركم 🙏" : lang === "nl" ? "⏳ Website in onderhoud\n\nWe werken aan verbeteringen. Probeer het later opnieuw.\n\nBedankt voor uw geduld 🙏" : lang === "fr" ? "⏳ Site en maintenance\n\nNous travaillons sur des améliorations. Réessayez plus tard.\n\nMerci de votre patience 🙏" : "⏳ Website under maintenance\n\nWe are working on improvements. Please try again later.\n\nThank you for your patience 🙏");
        } else if (data.alreadySubscribed) { setSubscribedData(data); setAlreadySubscribedModal(true); }
        else alert(data.message || "Er is een fout opgetreden");
      }
    } catch { alert(lang === "ar" ? "خطأ في الخادم!" : lang === "nl" ? "Serverfout!" : lang === "fr" ? "Erreur serveur!" : "Server error!"); }
    finally { setLoading(false); }
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
      style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 50%, #060818 100%)" }}>

      {/* خلفية ضوئية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08]" style={{ background: "#8b5cf6" }} />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08]" style={{ background: "#6366f1" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.05]" style={{ background: "#f59e0b" }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 w-full md:max-w-lg flex-1 md:flex-none flex flex-col">
        <div className="flex-1 flex flex-col md:rounded-3xl md:overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}>

          {/* Header */}
          <div className="px-5 md:px-6 pt-5 pb-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {isRtl ? <FaChevronRight className="text-white/60 text-sm" /> : <FaChevronLeft className="text-white/60 text-sm" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white/35 text-[10px] font-black uppercase tracking-widest">
                {lang === "ar" ? "إتمام الاشتراك" : lang === "nl" ? "Inschrijving voltooien" : lang === "fr" ? "Finaliser l'inscription" : "Complete registration"}
              </p>
              <h1 className="text-white font-black text-sm leading-tight truncate">{selectedData?.catName || "Rijbewijs"}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* أزرار اللغة */}
              <div className="flex gap-0.5 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                {[["nl","NL"],["fr","FR"],["ar","AR"],["en","EN"]].map(([code, label]) => (
                  <button key={code} type="button" onClick={() => setLang(code as any)}
                    className="px-2 py-1 rounded-md text-[10px] font-black transition-all"
                    style={lang === code ? { background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "white" } : { color: "rgba(255,255,255,0.3)" }}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
                {selectedData?.duration === "2w" ? "2W" : "1M"}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 pb-8 space-y-4">

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
                        style={{ color: isFocused ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-sm transition-colors"
                          style={{ [isRtl ? "right" : "left"]: "1rem", color: isFocused ? "#8b5cf6" : "rgba(255,255,255,0.2)" }}>
                          {icon}
                        </span>
                        <input
                          required type={type} placeholder={placeholder}
                          value={(formData as any)[key] || ""}
                          className="w-full py-3.5 text-sm font-medium text-white placeholder-white/15 rounded-xl outline-none transition-all"
                          style={{
                            paddingLeft: isRtl ? "1rem" : "2.75rem",
                            paddingRight: isRtl ? "2.75rem" : "1rem",
                            background: isFocused ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
                            border: isFocused ? "1.5px solid rgba(139,92,246,0.55)" : "1.5px solid rgba(255,255,255,0.08)",
                            boxShadow: isFocused ? "0 0 24px rgba(139,92,246,0.12), inset 0 0 0 1px rgba(139,92,246,0.1)" : "none",
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
                <p className="text-[11px] font-black uppercase tracking-wider mb-3 px-1" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                          background: active ? `${m.color}18` : "rgba(255,255,255,0.03)",
                          border: active ? `1.5px solid ${m.color}55` : "1.5px solid rgba(255,255,255,0.07)",
                          boxShadow: active ? `0 4px 20px ${m.glow}` : "none",
                        }}>
                        {active && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                            style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                        )}
                        <span className="text-xl transition-colors" style={{ color: active ? m.color : "rgba(255,255,255,0.2)" }}>{m.icon}</span>
                        <span className="text-[10px] font-black transition-colors" style={{ color: active ? m.color : "rgba(255,255,255,0.25)" }}>{m.label}</span>
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
                  background: loading ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 8px 32px rgba(139,92,246,0.45)",
                }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white/60">{lang === "ar" ? "جاري المعالجة..." : lang === "nl" ? "Verwerken..." : lang === "fr" ? "Traitement..." : "Processing..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t.submitOrder}
                    {isRtl ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal - اشتراك موجود */}
      {alreadySubscribedModal && subscribedData && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(160deg, #0f172a, #1e1b4b)", border: "1px solid rgba(139,92,246,0.2)" }}>
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
