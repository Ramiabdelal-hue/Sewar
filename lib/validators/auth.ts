/**
 * Validators — Auth
 * التحقق من صحة بيانات تسجيل الدخول والتسجيل
 */

export interface LoginInput {
  email: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLogin(data: unknown): { valid: true; data: LoginInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const d = data as Record<string, unknown>;

  if (!d || typeof d !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Invalid request body" }] };
  }

  if (!d.email || typeof d.email !== "string") {
    errors.push({ field: "email", message: "البريد الإلكتروني مطلوب" });
  } else if (d.email.length > 254) {
    errors.push({ field: "email", message: "البريد الإلكتروني طويل جداً" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    errors.push({ field: "email", message: "صيغة البريد الإلكتروني غير صحيحة" });
  }

  if (!d.password || typeof d.password !== "string") {
    errors.push({ field: "password", message: "كلمة المرور مطلوبة" });
  } else if (d.password.length > 128) {
    errors.push({ field: "password", message: "كلمة المرور طويلة جداً" });
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      email: (d.email as string).toLowerCase().trim(),
      password: d.password as string,
    },
  };
}
