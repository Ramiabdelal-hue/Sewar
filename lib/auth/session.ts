/**
 * Session management — server-side
 * يُستخدم داخل API routes للتحقق من هوية المستخدم
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  category: string;
  status: string;
  subscriptionType: string | null;
  examCategory: string | null;
  expiryDate: Date;
  sessionToken: string | null;
  subscriptions: {
    id: number;
    subscriptionType: string;
    category: string;
    examCategory: string | null;
    expiryDate: Date;
    isActive: boolean;
  }[];
}

/**
 * استخراج المستخدم من الـ request (Authorization header أو body)
 * يتحقق من sessionToken ويرجع المستخدم أو null
 */
export async function getUser(req: NextRequest): Promise<SessionUser | null> {
  try {
    // محاولة قراءة email + sessionToken من Authorization header
    const authHeader = req.headers.get("authorization");
    let email: string | null = null;
    let sessionToken: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      // format: "Bearer email:token"
      const decoded = Buffer.from(authHeader.slice(7), "base64").toString("utf-8");
      const [e, t] = decoded.split(":");
      email = e || null;
      sessionToken = t || null;
    }

    // fallback: قراءة من x-user-email header (للـ API routes القديمة)
    if (!email) {
      email = req.headers.get("x-user-email");
      sessionToken = req.headers.get("x-session-token");
    }

    if (!email) return null;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        subscriptions: {
          where: { isActive: true, expiryDate: { gt: new Date() } },
        },
      },
    });

    if (!user) return null;
    if (user.status === "suspended") return null;

    // التحقق من sessionToken إذا أُرسل
    if (sessionToken && user.sessionToken && user.sessionToken !== sessionToken) {
      return null;
    }

    // التحقق من انتهاء الاشتراك
    const now = new Date();
    const hasActiveSubscription = user.subscriptions.length > 0;
    const primaryExpiry = new Date(user.expiryDate);
    if (!hasActiveSubscription && primaryExpiry <= now) return null;

    return user as SessionUser;
  } catch {
    return null;
  }
}

/**
 * التحقق من صلاحية الجلسة فقط (بدون التحقق من الاشتراك)
 * يُستخدم في routes لا تحتاج اشتراكاً نشطاً
 */
export async function verifySession(email: string, sessionToken: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { sessionToken: true, status: true },
    });
    if (!user || user.status === "suspended") return false;
    if (!user.sessionToken) return false;
    return user.sessionToken === sessionToken;
  } catch {
    return false;
  }
}
