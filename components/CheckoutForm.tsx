"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import { FaQrcode, FaPaypal, FaCreditCard, FaLock, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export default function CheckoutForm({ selectedData, onBack, prefillData }: any) {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadySubscribedModal, setAlreadySubscribedModal] = useState(false);
  const [subscribedData, setSubscribedData] = useState<any>(null);
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
      alert(lang === "ar" ? "كلمات المرور غير متطابقة!" : "Passwords do not match!");
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
        if (data.alreadySubscribed) { setSubscribedData(data); setAlreadySubscribedModal(true); }
        else alert(data.message || "Er is een fout opgetreden");
      }
    } catch { alert(lang === "ar" ? "خطأ في الخادم!" : "Server error!"); }
    finally { setLoading(false); }
  };

  const payMethods = [
    { id: "bancontact", label: "Bancontact", icon: <FaCreditCard className="text-2xl" />, color: "#003399" },
    { id: "qr_scan",   label: "QR Code",    icon: <FaQrcode className="text-2xl" />,    color: "#f97316" },
    { id: "paypal",    label: "PayPal",      icon: <FaPaypal className="text-2xl" />,    color: "#0070ba" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:items-center md:justify-center py-0 md:py-8"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 50%, #060818 100%)" }}>

      {/* خلفية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-[80px]" style={{ background: "#ffcc00" }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-[80px]" style={{ background: "#3b82f6" }}></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}></div>
      </div>

      {/* البطاقة - على الموبايل تملأ الشاشة، على الكمبيوتر بطاقة محدودة */}
      <div className="relative z-10 w-full md:max-w-md flex-1 md:flex-none flex flex-col md:rounded-3xl md:overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "0px solid transparent" }}
        // على md: نضيف border
      >
        <div className="flex-1 flex flex-col md:rounded-3xl md:overflow-hidden"
          style={{ border: "0 solid transparent" }}>

          {/* Header */}
          <div className="px-4 md:px-6 pt-6 pb-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRtl ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M10 19l-7-7m0 0l7-7m-7 7h18"} />
              </svg>
            </button>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">
                {lang === "ar" ? "إتمام الاشتراك" : lang === "nl" ? "Inschrijving voltooien" : "Finaliser"}
              </p>
              <h1 className="text-white font-black text-base leading-tight">{selectedData?.catName || "Rijbewijs"}</h1>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(255,204,0,0.15)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.3)" }}>
                {selectedData?.duration === "2w" ? "2 Weken" : "1 Maand"}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-6">
            {successMsg && (
              <div className="mb-4 px-5 py-4 rounded-2xl text-center font-black text-sm"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white" }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* حقول البيانات */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {[
                  { icon: <FaUser />, label: t.fullNamePlaceholder, type: "text", key: "fullName", placeholder: "Jan Janssen", value: formData.fullName },
                  { icon: <FaEnvelope />, label: t.emailPlaceholder, type: "email", key: "email", placeholder: "jan@email.com", value: formData.email },
                  { icon: <FaPhone />, label: t.phonePlaceholder, type: "tel", key: "phone", placeholder: "+32 4XX XX XX XX", value: formData.phone },
                  { icon: <FaLock />, label: lang === "ar" ? "كلمة المرور" : "Wachtwoord", type: "password", key: "password", placeholder: "••••••••", value: "" },
                  { icon: <FaLock />, label: lang === "ar" ? "تأكيد كلمة المرور" : "Bevestig wachtwoord", type: "password", key: "confirmPassword", placeholder: "••••••••", value: "" },
                ].map((field, i, arr) => (
                  <div key={field.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-white/30 flex-shrink-0 text-sm">{field.icon}</span>
                    <div className="flex-1">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-0.5">{field.label}</p>
                      <input required type={field.type} placeholder={field.placeholder}
                        value={field.value !== undefined ? field.value : undefined}
                        className="w-full bg-transparent text-white text-sm font-medium placeholder-white/20 focus:outline-none"
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>

              {/* طريقة الدفع */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-3">{t.paymentQuestion}</p>
                <div className="grid grid-cols-3 gap-2">
                  {payMethods.map(m => {
                    const active = formData.paymentMethod === m.id;
                    return (
                      <button key={m.id} type="button" onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                        className="relative flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                        style={{
                          background: active ? `${m.color}20` : "rgba(255,255,255,0.04)",
                          border: active ? `1.5px solid ${m.color}60` : "1.5px solid rgba(255,255,255,0.08)",
                          boxShadow: active ? `0 4px 16px ${m.color}25` : "none",
                        }}>
                        {active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: m.color }}></div>}
                        <span style={{ color: active ? m.color : "rgba(255,255,255,0.35)" }}>{m.icon}</span>
                        <span className="text-[10px] font-black" style={{ color: active ? m.color : "rgba(255,255,255,0.35)" }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* أمان */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <FaLock className="text-green-400 text-xs flex-shrink-0" />
                <p className="text-green-400/70 text-[10px] font-bold">
                  {lang === "ar" ? "بياناتك محمية ومشفرة" : lang === "nl" ? "Uw gegevens zijn beveiligd en versleuteld" : "Vos données sont sécurisées"}
                </p>
              </div>

              {/* زر الإرسال */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #ffcc00, #ff9900)",
                  color: loading ? "rgba(255,255,255,0.5)" : "#003399",
                  boxShadow: loading ? "none" : "0 8px 30px rgba(255,204,0,0.35)",
                }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
                    <span>{lang === "ar" ? "جاري المعالجة..." : lang === "nl" ? "Verwerken..." : "Traitement..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t.submitOrder}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRtl ? "M11 19l-7-7m0 0l7-7m-7 7h18" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      {alreadySubscribedModal && subscribedData && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[99999] p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg, #0d1b4b, #060818)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-black text-white mb-2">
                {lang === "ar" ? "أنت مشترك بالفعل!" : lang === "nl" ? "Al geabonneerd!" : "Déjà abonné!"}
              </h2>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                {lang === "ar" ? "لديك اشتراك نشط." : lang === "nl" ? "Je hebt al een actief abonnement." : "Vous avez déjà un abonnement actif."}
              </p>
              <div className="px-4 py-3 rounded-xl mb-5 text-xs font-bold text-orange-300 break-all" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                {subscribedData.email}
              </div>
              <button onClick={() => { setAlreadySubscribedModal(false); setSubscribedData(null); }}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "white" }}>
                {lang === "ar" ? "إغلاق" : lang === "nl" ? "Sluiten" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
