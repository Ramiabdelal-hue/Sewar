"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("جاري التحقق من الدفع...");

  useEffect(() => {
    const email = searchParams.get("email");

    if (!email) {
      router.push("/");
      return;
    }

    // التحقق من حالة الدفع
    const checkPayment = async () => {
      try {
        const res = await fetch("/api/check-payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.paid) {
          setMessage("تم تفعيل اشتراكك بنجاح!");
          
          // حفظ البيانات في localStorage
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userCategory", data.subscription.category);
          localStorage.setItem("userExpiry", data.subscription.expiryDate);

          // إعادة التوجيه للمحتوى
          setTimeout(() => {
            router.push("/theorie");
          }, 2000);
        } else {
          // لم يتم تأكيد الدفع بعد، انتظر قليلاً
          setTimeout(checkPayment, 2000);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        setMessage("حدث خطأ في التحقق من الدفع");
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
        
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
}
