"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("جاري التحقق من الدفع...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const email = searchParams.get("email");

    if (!email) {
      router.push("/");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 30 ثانية كحد أقصى

    const checkPayment = async () => {
      attempts++;
      try {
        const res = await fetch("/api/check-payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.paid) {
          setMessage("تم تفعيل اشتراكك بنجاح! ✅");
          setChecking(false);

          localStorage.setItem("userEmail", email);
          if (data.subscription?.category) localStorage.setItem("userCategory", data.subscription.category);
          if (data.subscription?.expiryDate) localStorage.setItem("userExpiry", data.subscription.expiryDate);

          setTimeout(() => { router.push("/theorie"); }, 2000);

        } else if (attempts >= MAX_ATTEMPTS) {
          // تجاوز الحد الأقصى - أعطِ المستخدم خياراً
          setChecking(false);
          setFailed(true);
          setMessage("استغرق التحقق وقتاً طويلاً. إذا تم الدفع، سيتم تفعيل اشتراكك خلال دقائق.");
        } else {
          setTimeout(checkPayment, 2000);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        if (attempts >= MAX_ATTEMPTS) {
          setChecking(false);
          setFailed(true);
          setMessage("حدث خطأ في التحقق. تواصل معنا إذا تم الخصم من حسابك.");
        } else {
          setTimeout(checkPayment, 3000);
        }
      }
    };

    checkPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          شكراً لك!
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          {message}
        </p>
        
        {failed ? (
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/theorie")}
              className="px-6 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
              الذهاب للدروس
            </button>
            <button onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl font-black text-sm border-2 border-gray-200 text-gray-600">
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">جاري التحميل...</h1>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
