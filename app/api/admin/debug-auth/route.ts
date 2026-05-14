import { NextRequest, NextResponse } from "next/server";

// endpoint مؤقت للتشخيص فقط - يُحذف بعد حل المشكلة
// لا يحتاج admin token
export async function GET(_req: NextRequest) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  return NextResponse.json({
    hasUser: !!adminUser,
    hasPass: !!adminPass,
    userLength: adminUser?.length ?? 0,
    passLength: adminPass?.length ?? 0,
    // أول وآخر حرف فقط للتحقق من المسافات
    userFirst: adminUser?.[0] ?? null,
    userLast: adminUser?.[adminUser.length - 1] ?? null,
    passFirst: adminPass?.[0] ?? null,
    passLast: adminPass?.[adminPass.length - 1] ?? null,
  });
}
