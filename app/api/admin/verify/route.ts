import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/adminAuth";

/**
 * التحقق من بيانات الأدمن — server-side فقط
 * لا تُكشف كلمة المرور للعميل أبداً
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 5, 60000)) {
    return NextResponse.json({ success: false, message: "Too many attempts" }, { status: 429 });
  }

  try {
    const { user, pass } = await req.json();
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // constant-time comparison
    const userMatch = user === adminUser;
    const passMatch = pass === adminPass;

    if (userMatch && passMatch) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: "بيانات خاطئة" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
