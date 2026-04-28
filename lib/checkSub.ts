"use client";

/**
 * دالة موحدة للتحقق من الاشتراك مع timeout
 * تستخدمها جميع الصفحات
 */
export async function checkSub(email: string): Promise<{
  success: boolean;
  expired?: boolean;
  suspended?: boolean;
  sessionInvalid?: boolean;
  user?: any;
  subscriptions?: any[];
}> {
  try {
    const sessionToken =
      typeof window !== "undefined"
        ? localStorage.getItem("sessionToken") || undefined
        : undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("/api/check-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, sessionToken }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return { success: false };
    return await res.json();
  } catch {
    // عند timeout أو NetworkError - نسمح بالدخول
    return { success: true };
  }
}
