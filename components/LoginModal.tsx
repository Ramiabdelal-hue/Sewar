"use client";
import { useState } from "react";
import { FaUser, FaLock, FaTimes, FaChevronRight } from "react-icons/fa";

export default function LoginModal({ lang, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showSubscriptionChoice, setShowSubscriptionChoice] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  const redirectToSubscription = (subscription: any, email: string) => {
    const { type, category, expiryDate } = subscription;
    if (!email || !expiryDate) {
      alert(lang === "ar" ? "خطأ في بيانات الاشتراك" : lang === "nl" ? "Fout in abonnementsgegevens" : lang === "fr" ? "Erreur dans les données d'abonnement" : "Subscription data error");
      return;
    }
    if (type === "examen") window.location.assign(`/examen?email=${encodeURIComponent(email)}&cat=${category}&exp=${expiryDate}`);
    else if (type === "praktijk-lessons") window.location.assign(`/praktical/lessons?email=${encodeURIComponent(email)}&exp=${expiryDate}`);
    else if (type === "praktijk-exam") window.location.assign(`/praktical/exam?email=${encodeURIComponent(email)}&exp=${expiryDate}`);
    else window.location.assign(`/theorie`);
  };

  const getSubscriptionLabel = (subscription: any) => {
    const { type, category } = subscription;
    if (type === "examen") return lang === "ar" ? `امتحانات - فئة ${category}` : lang === "nl" ? `Examens - Categorie ${category}` : lang === "fr" ? `Examens - Catégorie ${category}` : `Exams - Category ${category}`;
    if (type === "praktijk-lessons") return lang === "ar" ? "دروس عملية - فيديوهات" : lang === "nl" ? "Praktijk - Lessen" : lang === "fr" ? "Pratique - Leçons" : "Practical - Lessons";
    if (type === "praktijk-exam") return lang === "ar" ? "دروس عملية - إدراك المخاطر" : lang === "nl" ? "Praktijk - Gevaarherkenning" : lang === "fr" ? "Pratique - Perception des dangers" : "Practical - Hazard Perception";
    return lang === "ar" ? `دروس نظرية - فئة ${category}` : lang === "nl" ? `Theorie - Categorie ${category}` : lang === "fr" ? `Théorie - Catégorie ${category}` : `Theory - Category ${category}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setIsSuspended(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      let data: any = {};
      try { data = await response.json(); } catch { data = { success: false, message: "خطأ في قراءة الاستجابة" }; }
      
      if (data.success) {
        if (data.role === "admin") { window.location.assign("/admin/questions"); return; }
        const { subscriptionType, cat, email, exp, subscriptions: userSubscriptions } = data;
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userCategory", cat);
        localStorage.setItem("userExpiry", String(exp));
        if (data.sessionToken) localStorage.setItem("sessionToken", data.sessionToken);
        window.dispatchEvent(new Event('userLoggedIn'));
        if (userSubscriptions && userSubscriptions.length > 1) {
          setSubscriptions(userSubscriptions);
          setShowSubscriptionChoice(true);
          setLoading(false);
          return;
        }
        const subscription = userSubscriptions && userSubscriptions.length > 0
          ? userSubscriptions[0]
          : { type: subscriptionType, category: cat, expiryDate: exp };
        redirectToSubscription(subscription, email);
      } else if (data.suspended) {
        // ── حساب معلق ──
        setIsSuspended(true);
      } else {
        setErrorMsg(data.message || (
          lang === "ar" ? "البيانات غير صحيحة" :
          lang === "nl" ? "Onjuiste gegevens" :
          lang === "fr" ? "Données incorrectes" : "Incorrect credentials"
        ));
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        setErrorMsg(lang === "ar" ? "انتهت مهلة الاتصال. حاول مرة أخرى." : lang === "nl" ? "Verbinding time-out. Probeer opnieuw." : "Connection timed out. Try again.");
      } else {
        setErrorMsg(lang === "ar" ? "البيانات غير صحيحة أو خطأ في الاتصال." : lang === "nl" ? "Onjuiste gegevens of verbindingsfout." : "Incorrect credentials or connection error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === "ar";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      {/* خلفية ضبابية */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* البطاقة */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>

        {/* توهج علوي */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6, #6366f1)" }} />

        {/* زر الإغلاق */}
        <button onClick={onClose}
          className="absolute top-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ [isRtl ? "left" : "right"]: "1rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <FaTimes className="text-white/60 text-sm" />
        </button>

        {!showSubscriptionChoice ? (
          <div className="px-7 pt-10 pb-8">
            {/* أيقونة */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: isSuspended ? "linear-gradient(135deg,#dc2626,#991b1b)" : "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: isSuspended ? "0 8px 32px rgba(220,38,38,0.5)" : "0 8px 32px rgba(139,92,246,0.5)" }}>
                {isSuspended ? <span className="text-2xl">🔒</span> : <FaUser className="text-white text-2xl" />}
              </div>
            </div>

            {/* ── شاشة التعليق ── */}
            {isSuspended ? (
              <div className="text-center">
                <h2 className="text-xl font-black text-white mb-3">
                  {lang === "ar" ? "تم تعليق حسابك" : lang === "nl" ? "Account opgeschort" : lang === "fr" ? "Compte suspendu" : "Account Suspended"}
                </h2>
                <div className="rounded-2xl p-4 mb-4 text-sm leading-relaxed"
                  style={{ background: "rgba(220,38,38,0.12)", border: "1.5px solid rgba(220,38,38,0.35)" }}>
                  <p className="text-red-300 font-bold mb-2">
                    {lang === "ar" ? "⛔ تم تعليق اشتراكك من قِبل المشرف." :
                     lang === "nl" ? "⛔ Uw abonnement is opgeschort door de beheerder." :
                     lang === "fr" ? "⛔ Votre abonnement a été suspendu par l'administrateur." :
                     "⛔ Your subscription has been suspended by the administrator."}
                  </p>
                  <p className="text-white/60 text-xs">
                    {lang === "ar" ? "للاستفسار وإعادة تفعيل حسابك، تواصل معنا:" :
                     lang === "nl" ? "Neem contact op om uw account te herstellen:" :
                     lang === "fr" ? "Contactez-nous pour rétablir votre compte:" :
                     "Contact us to restore your account:"}
                  </p>
                </div>
                {/* واتساب */}
                <a href="https://wa.me/32470813725" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm text-white mb-3 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg,#25d366,#128c7e)" }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {lang === "ar" ? "تواصل عبر واتساب" : lang === "nl" ? "Contact via WhatsApp" : lang === "fr" ? "Contacter via WhatsApp" : "Contact via WhatsApp"}
                </a>
                <a href="mailto:sewarrijbewijs@gmail.com"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs text-white/60 transition-all hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  📧 sewarrijbewijs@gmail.com
                </a>
                <button onClick={() => { setIsSuspended(false); setErrorMsg(null); }}
                  className="w-full mt-3 py-2 text-xs font-bold text-white/30 hover:text-white/50 transition-colors">
                  {lang === "ar" ? "← رجوع" : lang === "nl" ? "← Terug" : lang === "fr" ? "← Retour" : "← Back"}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-center text-white mb-1">
                  {lang === "ar" ? "مرحباً بعودتك" : lang === "nl" ? "Welkom terug" : lang === "fr" ? "Bon retour" : "Welcome back"}
                </h2>
                <p className="text-center text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {lang === "ar" ? "أدخل بياناتك للمتابعة" : lang === "nl" ? "Vul uw gegevens in" : lang === "fr" ? "Entrez vos informations" : "Enter your details to continue"}
                </p>

                {/* رسالة خطأ */}
                {errorMsg && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold text-center"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
              {/* حقل الإيميل */}
              <div className="relative">
                <label className="block text-xs font-bold mb-1.5 px-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {lang === "ar" ? "البريد الإلكتروني" : lang === "nl" ? "E-mailadres" : lang === "fr" ? "Adresse e-mail" : "Email address"}
                </label>
                <div className="relative">
                  <FaUser className="absolute top-1/2 -translate-y-1/2 text-sm transition-colors"
                    style={{ [isRtl ? "right" : "left"]: "1rem", color: focusedField === "email" ? "#8b5cf6" : "rgba(255,255,255,0.25)" }} />
                  <input
                    required type="email"
                    placeholder={lang === "ar" ? "example@email.com" : "jan@email.com"}
                    className="w-full py-3.5 text-sm font-medium text-white placeholder-white/20 rounded-xl outline-none transition-all"
                    style={{
                      paddingLeft: isRtl ? "1rem" : "2.75rem",
                      paddingRight: isRtl ? "2.75rem" : "1rem",
                      background: focusedField === "email" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.06)",
                      border: focusedField === "email" ? "1.5px solid rgba(139,92,246,0.6)" : "1.5px solid rgba(255,255,255,0.1)",
                      boxShadow: focusedField === "email" ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                    }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div className="relative">
                <label className="block text-xs font-bold mb-1.5 px-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {lang === "ar" ? "كلمة المرور" : lang === "nl" ? "Wachtwoord" : lang === "fr" ? "Mot de passe" : "Password"}
                </label>
                <div className="relative">
                  <FaLock className="absolute top-1/2 -translate-y-1/2 text-sm transition-colors"
                    style={{ [isRtl ? "right" : "left"]: "1rem", color: focusedField === "password" ? "#8b5cf6" : "rgba(255,255,255,0.25)" }} />
                  <input
                    required type="password" placeholder="••••••••"
                    className="w-full py-3.5 text-sm font-medium text-white placeholder-white/20 rounded-xl outline-none transition-all"
                    style={{
                      paddingLeft: isRtl ? "1rem" : "2.75rem",
                      paddingRight: isRtl ? "2.75rem" : "1rem",
                      background: focusedField === "password" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.06)",
                      border: focusedField === "password" ? "1.5px solid rgba(139,92,246,0.6)" : "1.5px solid rgba(255,255,255,0.1)",
                      boxShadow: focusedField === "password" ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                    }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                </div>
              </div>

              {/* زر الدخول */}
              <button
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-base transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
                style={{
                  background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 8px 30px rgba(139,92,246,0.45)",
                }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span className="text-white/70">...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
                    <FaChevronRight className={`text-xs ${isRtl ? "rotate-180" : ""}`} />
                  </span>
                )}
              </button>
            </form>
              </>
            )}
          </div>
        ) : (
          /* قائمة اختيار الاشتراك */
          <div className="px-7 pt-10 pb-8">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-center text-white mb-1">
              {lang === "ar" ? "اختر اشتراكك" : lang === "nl" ? "Kies je abonnement" : lang === "fr" ? "Choisissez votre abonnement" : "Choose subscription"}
            </h2>
            <p className="text-center text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lang === "ar" ? "لديك عدة اشتراكات نشطة" : lang === "nl" ? "Je hebt meerdere actieve abonnementen" : lang === "fr" ? "Vous avez plusieurs abonnements actifs" : "Multiple active subscriptions"}
            </p>

            <div className="space-y-2.5">
              {subscriptions.map((sub, index) => (
                <button key={index}
                  onClick={() => redirectToSubscription(sub, credentials.email)}
                  className="w-full rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-95 text-start"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1.5px solid rgba(139,92,246,0.25)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{getSubscriptionLabel(sub)}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {lang === "ar" ? `ينتهي: ${new Date(sub.expiryDate).toLocaleDateString('ar-EG')}` : lang === "nl" ? `Verloopt: ${new Date(sub.expiryDate).toLocaleDateString('nl-NL')}` : `Expires: ${new Date(sub.expiryDate).toLocaleDateString('en-GB')}`}
                      </p>
                    </div>
                    <FaChevronRight className={`text-purple-400 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => { setShowSubscriptionChoice(false); setSubscriptions([]); }}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
