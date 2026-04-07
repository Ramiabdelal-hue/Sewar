"use client";
import { useState } from "react";
import { FaUser, FaLock, FaTimes } from "react-icons/fa";

export default function LoginModal({ lang, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showSubscriptionChoice, setShowSubscriptionChoice] = useState(false);

  const redirectToSubscription = (subscription: any, email: string) => {
    const { type, category, expiryDate } = subscription;
    
    if (!email || !expiryDate) {
      alert(lang === "ar" ? "خطأ في بيانات الاشتراك" : "Subscription data error");
      return;
    }
    
    if (type === "examen") {
      window.location.assign(`/examen?email=${encodeURIComponent(email)}&cat=${category}&exp=${expiryDate}`);
    } else if (type === "praktijk-lessons") {
      window.location.assign(`/praktical/lessons?email=${encodeURIComponent(email)}&exp=${expiryDate}`);
    } else if (type === "praktijk-exam") {
      window.location.assign(`/praktical/exam?email=${encodeURIComponent(email)}&exp=${expiryDate}`);
    } else {
      // theorie - توجيه لصفحة الدروس مع الفئة
      window.location.assign(`/lessons?cat=${category}&email=${encodeURIComponent(email)}&exp=${expiryDate}`);
    }
  };

  const getSubscriptionLabel = (subscription: any) => {
    const { type, category } = subscription;
    
    if (type === "examen") {
      return lang === "ar" 
        ? `امتحانات - فئة ${category}` 
        : lang === "nl" 
        ? `Examens - Categorie ${category}` 
        : lang === "fr"
        ? `Examens - Catégorie ${category}`
        : `Exams - Category ${category}`;
    } else if (type === "praktijk-lessons") {
      return lang === "ar" 
        ? "دروس عملية - فيديوهات" 
        : lang === "nl" 
        ? "Praktijk - Lessen" 
        : lang === "fr"
        ? "Pratique - Leçons"
        : "Practical - Lessons";
    } else if (type === "praktijk-exam") {
      return lang === "ar" 
        ? "دروس عملية - إدراك المخاطر" 
        : lang === "nl" 
        ? "Praktijk - Gevaarherkenning" 
        : lang === "fr"
        ? "Pratique - Perception des dangers"
        : "Practical - Hazard Perception";
    } else {
      return lang === "ar" 
        ? `دروس نظرية - فئة ${category}` 
        : lang === "nl" 
        ? `Theorie - Categorie ${category}` 
        : lang === "fr"
        ? `Théorie - Catégorie ${category}`
        : `Theory - Category ${category}`;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // محاكاة التحقق أو الاتصال بـ API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log("📥 Login API response:", data);

      if (response.ok && data.success) {
        // توجيه الأدمن مباشرة
        if (data.role === "admin") {
          window.location.assign("/admin/questions");
          return;
        }

        // التوجيه حسب نوع الاشتراك
        const { subscriptionType, cat, email, exp, subscriptions: userSubscriptions } = data;
        
        console.log("✅ Login successful:", { subscriptionType, cat, email, exp, subscriptions: userSubscriptions });
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userCategory", cat);
        localStorage.setItem("userExpiry", String(exp));
        
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // إذا كان لديه اشتراكات متعددة، عرض قائمة الاختيار
        if (userSubscriptions && userSubscriptions.length > 1) {
          setSubscriptions(userSubscriptions);
          setShowSubscriptionChoice(true);
          setLoading(false);
          return;
        }
        
        // اشتراك واحد - توجيه مباشر
        const subscription = userSubscriptions && userSubscriptions.length > 0 
          ? userSubscriptions[0] 
          : { type: subscriptionType, category: cat, expiryDate: exp };
        
        redirectToSubscription(subscription, email);
      } else {
        console.error("❌ Login failed:", data);
        alert(data.message || (lang === "ar" ? "البيانات غير صحيحة" : "Onjuiste gegevens"));
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-black z-10">
          <FaTimes size={20} />
        </button>

        {!showSubscriptionChoice ? (
          // نموذج تسجيل الدخول
          <div className="p-8 pt-12">
            <h2 className="text-3xl font-black mb-2 text-center text-gray-800">
              {lang === "ar" ? "دخول المشتركين" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login"}
            </h2>
            <p className="text-gray-500 text-center mb-8 italic">
              {lang === "ar" ? "أدخل بياناتك لمتابعة دروسك" : lang === "nl" ? "Vul uw gegevens in" : lang === "fr" ? "Entrez vos informations" : "Enter your details to continue"}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  required
                  type="email"
                  placeholder={lang === "ar" ? "البريد الإلكتروني" : lang === "nl" ? "E-mail" : lang === "fr" ? "E-mail" : "Email"}
                  className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-brandOrange transition"
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  required
                  type="password"
                  placeholder={lang === "ar" ? "كلمة المرور" : lang === "nl" ? "Wachtwoord" : lang === "fr" ? "Mot de passe" : "Password"}
                  className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-brandOrange transition"
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-brandOrange text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-[1.02] transition active:scale-95 disabled:bg-gray-300"
              >
                {loading ? "..." : (lang === "ar" ? "دخول" : lang === "nl" ? "Inloggen" : lang === "fr" ? "Connexion" : "Login")}
              </button>
            </form>
          </div>
        ) : (
          // قائمة اختيار الاشتراك
          <div className="p-8 pt-12">
            <h2 className="text-2xl font-black mb-2 text-center text-gray-800">
              {lang === "ar" ? "اختر الاشتراك" : lang === "nl" ? "Kies je abonnement" : lang === "fr" ? "Choisissez votre abonnement" : "Choose your subscription"}
            </h2>
            <p className="text-gray-500 text-center mb-6 text-sm">
              {lang === "ar" ? "لديك عدة اشتراكات نشطة" : lang === "nl" ? "Je hebt meerdere actieve abonnementen" : lang === "fr" ? "Vous avez plusieurs abonnements actifs" : "You have multiple active subscriptions"}
            </p>

            <div className="space-y-3">
              {subscriptions.map((sub, index) => (
                <button
                  key={index}
                  onClick={() => redirectToSubscription(sub, credentials.email)}
                  className="w-full bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-orange-200 hover:border-orange-400 rounded-2xl p-5 transition-all hover:scale-[1.02] active:scale-95 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {getSubscriptionLabel(sub)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === "ar" 
                          ? `ينتهي في: ${new Date(sub.expiryDate).toLocaleDateString('ar-EG')}` 
                          : lang === "nl"
                          ? `Verloopt op: ${new Date(sub.expiryDate).toLocaleDateString('nl-NL')}`
                          : lang === "fr"
                          ? `Expire le: ${new Date(sub.expiryDate).toLocaleDateString('fr-FR')}`
                          : `Expires on: ${new Date(sub.expiryDate).toLocaleDateString('en-GB')}`
                        }
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowSubscriptionChoice(false);
                setSubscriptions([]);
              }}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 font-medium py-2"
            >
              {lang === "ar" ? "العودة" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}