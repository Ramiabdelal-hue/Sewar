import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - جلب البراكتيك حسب النوع
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    console.log(`🔍 Fetching praktijk for type: ${type || 'all'}`);

    let items;

    if (type === "oefenvideo" || type === "gevaarherkenning") {
      // جلب نوع معين
      items = await prisma.praktijk.findMany({
        where: {
          type: type
        },
        orderBy: {
          id: 'asc'
        }
      });
    } else {
      // جلب جميع العناصر
      items = await prisma.praktijk.findMany({
        orderBy: {
          id: 'asc'
        }
      });
    }

    console.log(`✅ Found ${items.length} praktijk items`);

    return NextResponse.json({
      success: true,
      items: items
    });

  } catch (error) {
    console.error("❌ Error fetching praktijk:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب البراكتيك",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
