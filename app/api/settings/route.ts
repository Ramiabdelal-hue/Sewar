import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

const DEFAULT_PRICES: Record<string, string> = {
  theorie_2w: "25", theorie_1m: "50",
  praktijk_training: "49", praktijk_hazard: "39",
  examen_2w: "25", examen_1m: "50",
};

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULT_PRICES };
    settings.forEach(s => { result[s.key] = s.value; });
    return NextResponse.json({ success: true, settings: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في جلب الإعدادات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // ✅ حماية: فقط الأدمن يمكنه تعديل الأسعار
  if (!verifyAdminToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const updates = body.settings as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return NextResponse.json({ success: true, message: "تم حفظ الأسعار بنجاح" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}
