import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchName = searchParams.get("name");
    const searchMonth = searchParams.get("month");
    const searchCategory = searchParams.get("category");
    const searchType = searchParams.get("type");
    const getNames = searchParams.get("getNames"); // للحصول على قائمة الأسماء

    console.log("📥 Received search params:", {
      name: searchName,
      month: searchMonth,
      category: searchCategory,
      type: searchType
    });

    // إذا كان الطلب للحصول على قائمة الأسماء فقط
    if (getNames === "true") {
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json({
        success: true,
        names: users
      });
    }

    // بناء شروط البحث
    const whereConditions: any = {};

    if (searchName) {
      whereConditions.OR = [
        { name: { contains: searchName, mode: 'insensitive' } },
        { email: { contains: searchName, mode: 'insensitive' } }
      ];
    }

    if (searchMonth) {
      const [year, month] = searchMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      console.log("🔍 Searching for month:", searchMonth);
      console.log("📅 Start date:", startDate);
      console.log("📅 End date:", endDate);
      
      whereConditions.subscriptions = {
        some: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          isActive: true
        }
      };
    }

    if (searchCategory) {
      if (whereConditions.subscriptions) {
        // إذا كان هناك شرط subscriptions موجود بالفعل، نضيف إليه
        whereConditions.subscriptions.some = {
          ...whereConditions.subscriptions.some,
          category: searchCategory
        };
      } else {
        whereConditions.subscriptions = {
          some: {
            category: searchCategory,
            isActive: true
          }
        };
      }
    }

    if (searchType) {
      if (whereConditions.subscriptions) {
        // إذا كان هناك شرط subscriptions موجود بالفعل، نضيف إليه
        whereConditions.subscriptions.some = {
          ...whereConditions.subscriptions.some,
          subscriptionType: searchType
        };
      } else {
        whereConditions.subscriptions = {
          some: {
            subscriptionType: searchType,
            isActive: true
          }
        };
      }
    }

    console.log("🔎 Where conditions:", JSON.stringify(whereConditions, null, 2));

    // جلب المشتركين مع اشتراكاتهم
    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        subscriptions: {
          where: {
            isActive: true
          }
        }
      } as any,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("📊 Found users:", users.length);

    // تعريف أسعار الباقات
    const packagePrices: Record<string, number> = {
      'theorie': 25,
      'examen': 25,
      'praktijk-lessons': 49,
      'praktijk-exam': 39
    };

    // تحويل البيانات لعرض كل اشتراك على حدة
    const subscriptionRows: any[] = [];
    users.forEach((user: any) => {
      if (user.subscriptions && user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub: any) => {
          // حساب المبلغ بناءً على نوع الاشتراك
          const amount = packagePrices[sub.subscriptionType] || 25;
          
          subscriptionRows.push({
            id: `${user.id}-${sub.id}`,
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            paymentType: user.paymentType,
            amount: amount,
            subscriptionType: sub.subscriptionType,
            category: sub.category,
            expiryDate: sub.expiryDate,
            createdAt: sub.createdAt,
            isActive: sub.isActive
          });
        });
      }
    });

    console.log("📊 Total subscription rows:", subscriptionRows.length);

    // حساب الإحصائيات
    const totalSubscribers = users.length;
    
    // حساب المبلغ الإجمالي
    let totalRevenue = 0;
    subscriptionRows.forEach((row: any) => {
      totalRevenue += row.amount;
    });

    // تجميع البيانات حسب الفئة
    const categoryStats: Record<string, number> = {};
    subscriptionRows.forEach((row: any) => {
      categoryStats[row.category] = (categoryStats[row.category] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionRows,
        stats: {
          totalSubscribers,
          totalRevenue,
          categoryStats,
          totalSubscriptions: subscriptionRows.length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({
      success: false,
      message: "خطأ في جلب بيانات المشتركين"
    }, { status: 500 });
  }
}
