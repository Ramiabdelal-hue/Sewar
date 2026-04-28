"use client";
import { useState } from "react";
import { FaUser, FaLock, FaTimes, FaChevronRight } from "react-icons/fa";

export default function LoginModal({ lang, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showSubscriptionChoice, setShowSubscriptionChoice] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      
      // قراءة الـ response حتى لو كان 401
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { success: false, message: "خطأ في قراءة الاستجابة" };
      }
      
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
      } else {
        alert(data.message || (lang === "ar" ? "البيانات غير صحيحة" : lang === "nl" ? "Onjuiste gegevens" : lang === "fr" ? "Données incorrectes" : "Incorrect credentials"));
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // NetworkError في Firefox عند 401 - نعرض رسالة واضحة
      if (error?.name === 'AbortError') {
        alert(lang === "ar" ? "انتهت مهلة الاتصال. حاول مرة أخرى." : lang === "nl" ? "Verbinding time-out. Probeer opnieuw." : "Connection timed out. Try again.");
      } else {
        alert(lang === "ar" ? "البيانات غير صحيحة أو خطأ في الاتصال." : lang === "nl" ? "Onjuiste gegevens of verbindingsfout." : "Incorrect credentials or connection error.");
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
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 32px rgba(139,92,246,0.5)" }}>
                <FaUser className="text-white text-2xl" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-center text-white mb-1">
              {lang === "ar" ? "مرحباً بعودتك" : lang === "nl" ? "Welkom terug" : lang === "fr" ? "Bon retour" : "Welcome back"}
            </h2>
            <p className="text-center text-sm mb-7" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lang === "ar" ? "أدخل بياناتك للمتابعة" : lang === "nl" ? "Vul uw gegevens in" : lang === "fr" ? "Entrez vos informations" : "Enter your details to continue"}
            </p>

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
