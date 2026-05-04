import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, unauthorizedResponse } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) return unauthorizedResponse();
  try {
    const { searchParams } = new URL(request.url);
    const searchName = searchParams.get("name");
    const searchMonth = searchParams.get("month");
    const searchCategory = searchParams.get("category");
    const searchType = searchParams.get("type");
    const getNames = searchParams.get("getNames");
    const screenshotsOnly = searchParams.get("screenshotsOnly"); // ── جديد: سريع

    // ── endpoint سريع: screenshots فقط ──────────────────────────────────────
    if (screenshotsOnly === "1") {
      const allScreenshots = await prisma.activityLog.findMany({
        where: { eventType: "screenshot_attempt" },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { userEmail: true, page: true, ip: true, createdAt: true, userAgent: true },
      });
      return NextResponse.json({
        success: true,
        data: {
          allScreenshots: allScreenshots.map(s => ({
            userEmail: s.userEmail,
            page: s.page,
            ip: s.ip,
            date: s.createdAt,
            userAgent: s.userAgent,
          })),
        },
      });
    }

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
          where: { isActive: true }
        }
      } as any,
      orderBy: { createdAt: 'desc' },
    });

    // جلب آخر نشاط لكل مستخدم (pageviews + screenshots)
    const recentActivityByUser = await prisma.activityLog.findMany({
      where: {
        userEmail: { in: users.map((u: any) => u.email) },
        eventType: { in: ['pageview', 'screenshot_attempt', 'login'] }
      },
      orderBy: { createdAt: 'desc' },
      select: { userEmail: true, eventType: true, page: true, createdAt: true, ip: true }
    });

    // تجميع النشاط حسب البريد
    const activityByEmail: Record<string, any[]> = {};
    recentActivityByUser.forEach((log: any) => {
      if (!activityByEmail[log.userEmail]) activityByEmail[log.userEmail] = [];
      if (activityByEmail[log.userEmail].length < 20) {
        activityByEmail[log.userEmail].push(log);
      }
    });

    // تعريف أسعار الباقات
    const packagePrices: Record<string, number> = {
      'theorie': 25,
      'examen': 25,
      'praktijk-lessons': 49,
      'praktijk-exam': 39
    };

    // تحويل البيانات لعرض كل اشتراك على حدة
    const subscriptionRows: any[] = [];
    
    // جلب جميع screenshot_attempts (حتى بدون email)
    const allScreenshots = await prisma.activityLog.findMany({
      where: { eventType: 'screenshot_attempt' },
      orderBy: { createdAt: 'desc' },
      select: { userEmail: true, page: true, ip: true, createdAt: true, userAgent: true },
    });

    // تجميع محاولات Screenshot حسب البريد الإلكتروني
    const screenshotsByEmail: Record<string, any[]> = {};
    allScreenshots.forEach((log: any) => {
      const key = log.userEmail || `ip:${log.ip}`;
      if (!screenshotsByEmail[key]) screenshotsByEmail[key] = [];
      screenshotsByEmail[key].push({
        date: log.createdAt,
        page: log.page || 'غير محدد',
        ip: log.ip || 'unknown',
        userAgent: log.userAgent || null,
      });
    });

    users.forEach((user: any) => {
      if (user.subscriptions && user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub: any) => {
          // حساب المبلغ بناءً على نوع الاشتراك
          const amount = packagePrices[sub.subscriptionType] || 25;
          
          // الحصول على محاولات Screenshot للمستخدم
          const userScreenshots = screenshotsByEmail[user.email] || [];
          
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
            isActive: sub.isActive,
            userStatus: user.status,
            lastSeen: (user as any).lastSeen || null,
            recentActivity: activityByEmail[user.email] || [],
            screenshotDetails: {
              count: userScreenshots.length,
              attempts: userScreenshots
            }
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

    // حساب المشتركين الذين لديهم أكثر من 3 محاولات screenshot
    const suspiciousUsers = subscriptionRows.filter((row: any) => 
      row.screenshotDetails && row.screenshotDetails.count > 3
    );

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionRows,
        allScreenshots: allScreenshots.map((s: any) => ({
          userEmail: s.userEmail,
          page: s.page,
          ip: s.ip,
          date: s.createdAt,
          userAgent: s.userAgent,
        })),
        stats: {
          totalSubscribers,
          totalRevenue,
          categoryStats,
          totalSubscriptions: subscriptionRows.length
        },
        warnings: {
          suspiciousScreenshots: suspiciousUsers.length,
          suspiciousUsers: suspiciousUsers.map((u: any) => ({
            name: u.name,
            email: u.email,
            phone: u.phone,
            attempts: u.screenshotDetails.count
          }))
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
