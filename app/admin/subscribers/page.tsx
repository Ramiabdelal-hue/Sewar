"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminManifest from "@/components/AdminManifest";

interface SubscriptionRow {
  id: string;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  paymentType: string;
  amount: number;
  subscriptionType: string;
  category: string;
  expiryDate: string;
  createdAt: string;
  isActive: boolean;
  userStatus?: string;
  screenshotAttempts?: number;
  screenshotDetails?: {
    count: number;
    attempts: Array<{
      date: string;
      page: string;
      ip: string;
    }>;
  };
}

interface Stats {
  totalSubscribers: number;
  totalRevenue: number;
  categoryStats: Record<string, number>;
  totalSubscriptions: number;
}

interface Warnings {
  suspiciousScreenshots: number;
  suspiciousUsers: Array<{
    name: string;
    email: string;
    phone: string | null;
    attempts: number;
  }>;
}

interface ActivityStats {
  todayVisitors: number;
  todayLoggedIn: number;
  weekVisitors: number;
  totalUniqueVisitors: number;
  screenshotAttempts: number;
  topPages: { page: string; count: number }[];
  recentActivity: any[];
  recentScreenshots: any[];
}

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [warnings, setWarnings] = useState<Warnings | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableNames, setAvailableNames] = useState<{name: string, email: string}[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activeTab, setActiveTab] = useState<"subscribers" | "activity" | "screenshots">("subscribers");
  const [selectedUserScreenshots, setSelectedUserScreenshots] = useState<any>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [suspendLoading, setSuspendLoading] = useState<string | null>(null); // email of user being suspended
  const [suspendResult, setSuspendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<any>(null); // user object
  const [suspendReason, setSuspendReason] = useState("");

  const sendWarningEmail = async (email: string) => {
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/admin/send-warning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email }),
      });
      const data = await res.json();
      setEmailResult({ success: data.success, message: data.message });
    } catch {
      setEmailResult({ success: false, message: "خطأ في الاتصال بالخادم" });
    } finally {
      setEmailSending(false);
    }
  };

  const suspendUser = async (email: string, action: "suspend" | "unsuspend") => {
    setSuspendLoading(email);
    setSuspendResult(null);
    try {
      const res = await fetch("/api/admin/suspend-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, action, reason: suspendReason }),
      });
      const data = await res.json();
      setSuspendResult({ success: data.success, message: data.message });
      if (data.success) {
        // تحديث حالة المشترك في القائمة محلياً
        setSubscriptions(prev =>
          prev.map(s =>
            s.email === email
              ? { ...s, isActive: action === "unsuspend" }
              : s
          )
        );
        setShowSuspendModal(null);
        setSuspendReason("");
        // إعادة تحميل البيانات
        setTimeout(fetchSubscribers, 500);
      }
    } catch {
      setSuspendResult({ success: false, message: "خطأ في الاتصال بالخادم" });
    } finally {
      setSuspendLoading(null);
    }
  };
  
  // فلاتر البحث
  const [searchName, setSearchName] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchType, setSearchType] = useState("");

  // معلومات الفئات حسب نوع الاشتراك
  const getCategoryInfo = (type: string) => {
    const info: Record<string, string> = {
      'theorie': 'دروس نظرية',
      'examen': 'امتحانات',
      'praktijk-lessons': 'دروس عملية - فيديوهات',
      'praktijk-exam': 'دروس عملية - إدراك المخاطر'
    };
    return info[type] || '';
  };

  // جلب قائمة الأسماء المتاحة
  useEffect(() => {
    if (isLogged) {
      fetchAvailableNames();
      fetchActivityStats();
    }
  }, [isLogged]);

  const fetchActivityStats = async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (data.success) setActivityStats(data.stats);
    } catch {}
  };

  const fetchAvailableNames = async () => {
    try {
      const response = await fetch("/api/admin/subscribers?getNames=true");
      const data = await response.json();
      if (data.success) {
        setAvailableNames(data.names);
      }
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };

  const handleLogin = () => {
    const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER || "sewar";
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "70709090";
    if (user === adminUser && password === adminPass) {
      setIsLogged(true);
      fetchSubscribers();
    } else {
      alert("بيانات الدخول غير صحيحة");
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append("name", searchName);
      if (searchMonth) params.append("month", searchMonth);
      if (searchCategory) params.append("category", searchCategory);
      if (searchType) params.append("type", searchType);

      console.log("🔍 Fetching with params:", {
        name: searchName,
        month: searchMonth,
        category: searchCategory,
        type: searchType
      });

      const response = await fetch(`/api/admin/subscribers?${params.toString()}`);
      const data = await response.json();

      console.log("📥 Received data:", data);

      if (data.success) {
        setSubscriptions(data.data.subscriptions);
        setStats(data.data.stats);
        setWarnings(data.data.warnings);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogged) {
      fetchSubscribers();
    }
  }, [searchName, searchMonth, searchCategory, searchType]);

  const getPackageLabel = (type: string) => {
    const labels: Record<string, string> = {
      'theorie': 'دروس نظرية',
      'examen': 'امتحانات',
      'praktijk-lessons': 'دروس عملية - فيديوهات',
      'praktijk-exam': 'دروس عملية - إدراك المخاطر'
    };
    return labels[type] || type;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cash': 'نقدي',
      'card': 'بطاقة',
      'bancontact': 'Bancontact',
      'payconiq': 'Payconiq',
      'bank_transfer': 'تحويل بنكي'
    };
    return labels[type] || type;
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة المشتركين</h1>
            <p className="text-gray-500 mt-2">تسجيل الدخول للوصول إلى لوحة التحكم</p>
          </div>
          <input
            type="text"
            placeholder="اسم المستخدم"
            className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:border-blue-500 focus:outline-none transition"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full p-4 border-2 border-gray-200 rounded-lg mb-6 focus:border-blue-500 focus:outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
            onClick={handleLogin}
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminManifest />
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                إدارة المشتركين
              </h1>
              <p className="text-gray-500 mt-1 mr-15">عرض وإدارة جميع المشتركين</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/questions")}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                إدارة الأسئلة
              </button>
              <button
                onClick={() => setIsLogged(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* تحذير المحاولات المشبوهة */}
        {warnings && warnings.suspiciousScreenshots > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                ⚠️
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  تحذير أمني: محاولات Screenshot مشبوهة
                </h3>
                <p className="text-white/90 mb-4">
                  يوجد <span className="font-black text-2xl mx-1">{warnings.suspiciousScreenshots}</span> 
                  مشترك حاولوا أخذ أكثر من 3 لقطات شاشة
                </p>
                <div className="bg-white/10 rounded-xl p-4 space-y-2">
                  {warnings.suspiciousUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-black">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-white/70">{user.email}</p>
                          {user.phone && <p className="text-xs text-white/70">📱 {user.phone}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-black">{user.attempts}</div>
                          <div className="text-xs text-white/70">محاولة</div>
                        </div>
                        {user.phone && (
                          <button
                            onClick={() => sendWarningEmail(user.email)}
                            disabled={emailSending}
                            className="flex items-center gap-1 px-3 py-2 bg-white text-red-600 rounded-lg text-xs font-black hover:bg-red-50 transition disabled:opacity-60"
                          >
                            <span>📧</span>
                            <span>إيميل</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويبات */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "subscribers", label: "👥 المشتركون" },
            { key: "activity", label: "📊 الزوار والنشاط" },
            { key: "screenshots", label: "📸 محاولات Screenshot" },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); if (tab.key !== "subscribers") fetchActivityStats(); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.key ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* تبويب الزوار */}
        {activeTab === "activity" && activityStats && (
          <div className="space-y-6">
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "زوار اليوم", value: activityStats.todayVisitors, icon: "👁", color: "from-blue-500 to-blue-600" },
                { label: "مسجلون اليوم", value: activityStats.todayLoggedIn, icon: "🔐", color: "from-green-500 to-green-600" },
                { label: "زوار آخر 7 أيام", value: activityStats.weekVisitors, icon: "📅", color: "from-purple-500 to-purple-600" },
                { label: "إجمالي الزوار", value: activityStats.totalUniqueVisitors, icon: "🌍", color: "from-orange-500 to-orange-600" },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="text-3xl font-black">{s.value}</div>
                  <div className="text-white/80 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* أكثر الصفحات زيارة */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-black text-gray-800 mb-4">📄 أكثر الصفحات زيارة (آخر 7 أيام)</h3>
              <div className="space-y-2">
                {activityStats.topPages.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{p.page}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* آخر النشاطات */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-black text-gray-800 mb-4">🕐 آخر النشاطات</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activityStats.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.eventType === "screenshot_attempt" ? "bg-red-500" : "bg-green-500"}`} />
                    <span className="text-xs text-gray-500 flex-shrink-0">{new Date(a.createdAt).toLocaleString("ar-EG")}</span>
                    <span className="text-xs font-bold text-gray-700 flex-shrink-0">{a.eventType === "screenshot_attempt" ? "📸 Screenshot" : "👁 زيارة"}</span>
                    <span className="text-xs text-gray-500 truncate">{a.page || "-"}</span>
                    {a.userEmail && <span className="text-xs text-blue-600 truncate">{a.userEmail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تبويب Screenshots */}
        {activeTab === "screenshots" && activityStats && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">📸</div>
              <div>
                <h3 className="text-lg font-black text-gray-800">محاولات Screenshot</h3>
                <p className="text-sm text-red-600 font-bold">{activityStats.screenshotAttempts} محاولة في آخر 30 يوم</p>
              </div>
            </div>
            {activityStats.recentScreenshots.length === 0 ? (
              <p className="text-center text-gray-400 py-8">✅ لا توجد محاولات مسجلة</p>
            ) : (
              <div className="space-y-3">
                {activityStats.recentScreenshots.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{s.userEmail || "زائر غير مسجل"}</p>
                      <p className="text-xs text-gray-500">{s.page} · IP: {s.ip}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{new Date(s.createdAt).toLocaleString("ar-EG")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* تبويب المشتركين */}
        {activeTab === "subscribers" && (
          <div>
          {/* Statistics Cards */}
          {stats && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-1">{stats.totalSubscribers}</h3>
              <p className="text-blue-100 font-medium">إجمالي المشتركين</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-1">€{stats.totalRevenue}</h3>
              <p className="text-green-100 font-medium">إجمالي الإيرادات</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-1">{stats.totalSubscriptions}</h3>
              <p className="text-purple-100 font-medium">إجمالي الاشتراكات</p>
              {stats.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs text-purple-100 mb-2">
                    {searchType ? `توزيع الفئات في ${getCategoryInfo(searchType)}:` : 'توزيع الفئات:'}
                  </p>
                  {Object.entries(stats.categoryStats).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between text-sm mb-1">
                      <span>فئة {cat}:</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            فلاتر البحث
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث بالاسم أو البريد</label>
              <input
                type="text"
                list="names-list"
                placeholder="اختر من القائمة..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <datalist id="names-list">
                {availableNames.map((item, idx) => (
                  <option key={idx} value={item.name}>{item.email}</option>
                ))}
                {availableNames.map((item, idx) => (
                  <option key={`email-${idx}`} value={item.email}>{item.name}</option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
              <input
                type="month"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الاشتراك</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="">جميع الأنواع</option>
                <option value="theorie">دروس نظرية (Theorie)</option>
                <option value="examen">امتحانات (Examen)</option>
                <option value="praktijk-lessons">دروس عملية - فيديوهات</option>
                <option value="praktijk-exam">دروس عملية - إدراك المخاطر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">جميع الفئات</option>
                <option value="A">
                  فئة A {searchType && `- ${getCategoryInfo(searchType)}`}
                </option>
                <option value="B">
                  فئة B {searchType && `- ${getCategoryInfo(searchType)}`}
                </option>
                <option value="C">
                  فئة C {searchType && `- ${getCategoryInfo(searchType)}`}
                </option>
              </select>
              {searchType && (
                <p className="mt-2 text-xs text-gray-500">
                  📌 البحث في: {getCategoryInfo(searchType)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3 items-center">
            <button
              onClick={() => {
                setSearchName("");
                setSearchMonth("");
                setSearchCategory("");
                setSearchType("");
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              مسح الفلاتر
            </button>
            
            {/* عرض الفلاتر النشطة */}
            <div className="flex gap-2 flex-wrap">
              {searchName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {searchName}
                </span>
              )}
              {searchMonth && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {searchMonth}
                </span>
              )}
              {searchType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {getCategoryInfo(searchType)}
                </span>
              )}
              {searchCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  فئة {searchCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              قائمة الاشتراكات ({subscriptions.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">جاري التحميل...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">لم يتم العثور على مشتركين بهذه المعايير</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">الاسم</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">البريد الإلكتروني</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">الهاتف</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">نوع الاشتراك</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">الفئة</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">نوع الدفع</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">المبلغ</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">تاريخ الانتهاء</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">تاريخ الاشتراك</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">الحالة</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">📸 Screenshots</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">⚙️ إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {sub.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium text-gray-900 text-sm">{sub.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sub.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sub.phone || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {getPackageLabel(sub.subscriptionType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            فئة {sub.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            {getPaymentTypeLabel(sub.paymentType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            €{sub.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(sub.expiryDate).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(sub.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            new Date(sub.expiryDate) > new Date()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {new Date(sub.expiryDate) > new Date() ? 'نشط' : 'منتهي'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {sub.screenshotDetails && sub.screenshotDetails.count > 0 ? (
                            <button
                              onClick={() => setSelectedUserScreenshots(sub)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                sub.screenshotDetails.count > 3
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200 animate-pulse'
                                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              }`}
                            >
                              <span className="text-base">📸</span>
                              <span>{sub.screenshotDetails.count}</span>
                              {sub.screenshotDetails.count > 3 && <span className="text-base">⚠️</span>}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        {/* عمود الإجراءات */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {sub.userStatus === "suspended" ? (
                              <button
                                onClick={() => setShowSuspendModal({ ...sub, action: "unsuspend" })}
                                disabled={suspendLoading === sub.email}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 transition disabled:opacity-60"
                              >
                                <span>✅</span>
                                <span>رفع التعليق</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowSuspendModal({ ...sub, action: "suspend" })}
                                disabled={suspendLoading === sub.email}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition disabled:opacity-60"
                              >
                                <span>🔒</span>
                                <span>تعليق</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </div>
        )}
      </div>

      {/* Modal لعرض تفاصيل محاولات Screenshot */}
      {selectedUserScreenshots && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUserScreenshots(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b ${selectedUserScreenshots.screenshotDetails.count > 3 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${selectedUserScreenshots.screenshotDetails.count > 3 ? 'bg-red-100' : 'bg-orange-100'}`}>
                    📸
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                      محاولات Screenshot
                      {selectedUserScreenshots.screenshotDetails.count > 3 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-xs animate-pulse">
                          ⚠️ تحذير
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-bold">{selectedUserScreenshots.screenshotDetails.count}</span> محاولة مسجلة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserScreenshots(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* معلومات المشترك */}
            <div className="p-6 bg-gray-50 border-b">
              <h4 className="text-sm font-bold text-gray-600 mb-3">معلومات المشترك</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">الاسم</p>
                  <p className="font-bold text-gray-800">{selectedUserScreenshots.name}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-bold text-gray-800 text-sm">{selectedUserScreenshots.email}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-gray-800">{selectedUserScreenshots.phone || 'غير متوفر'}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">نوع الاشتراك</p>
                  <p className="font-bold text-gray-800">{getPackageLabel(selectedUserScreenshots.subscriptionType)}</p>
                </div>
              </div>
            </div>

            {/* قائمة المحاولات */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-600 mb-4">تفاصيل المحاولات</h4>
              <div className="space-y-3">
                {selectedUserScreenshots.screenshotDetails.attempts.map((attempt: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-2 ${
                      idx < 3 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        idx < 3 ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-gray-800">
                            {new Date(attempt.date).toLocaleString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                          {idx >= 3 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                              ⚠️ مشبوه
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                            </svg>
                            {attempt.page}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            IP: {attempt.ip}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex flex-col gap-3">
                {/* نتيجة إرسال الإيميل */}
                {emailResult && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
                    emailResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    <span>{emailResult.success ? "✅" : "❌"}</span>
                    <span>{emailResult.message}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  {/* زر إرسال إيميل تحذيري */}
                  <button
                    onClick={() => sendWarningEmail(selectedUserScreenshots.email)}
                    disabled={emailSending}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {emailSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">📧</span>
                        <span>إرسال إيميل تحذيري</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setSelectedUserScreenshots(null); setEmailResult(null); }}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal تأكيد التعليق / رفع التعليق */}
      {showSuspendModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowSuspendModal(null); setSuspendReason(""); setSuspendResult(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 ${showSuspendModal.action === "suspend" ? "bg-purple-600" : "bg-green-600"}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{showSuspendModal.action === "suspend" ? "🔒" : "✅"}</span>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {showSuspendModal.action === "suspend" ? "تعليق الاشتراك مؤقتاً" : "رفع التعليق"}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">{showSuspendModal.name}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">الاسم</span>
                  <span className="font-bold">{showSuspendModal.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">البريد</span>
                  <span className="font-bold text-blue-600">{showSuspendModal.email}</span>
                </div>
                {showSuspendModal.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الهاتف</span>
                    <span className="font-bold">{showSuspendModal.phone}</span>
                  </div>
                )}
              </div>

              {showSuspendModal.action === "suspend" && (
                <>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    سبب التعليق (اختياري - سيُرسل في الإيميل)
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="مثال: محاولات متكررة لأخذ لقطات شاشة..."
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ سيتم إرسال إيميل إشعار للمشترك وإجباره على تسجيل الخروج فوراً
                  </p>
                </>
              )}

              {showSuspendModal.action === "unsuspend" && (
                <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3">
                  ✅ سيتم رفع التعليق وإعادة تفعيل الاشتراك فوراً
                </p>
              )}

              {/* نتيجة العملية */}
              {suspendResult && (
                <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
                  suspendResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  <span>{suspendResult.success ? "✅" : "❌"}</span>
                  <span>{suspendResult.message}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => suspendUser(showSuspendModal.email, showSuspendModal.action)}
                disabled={suspendLoading === showSuspendModal.email}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white transition disabled:opacity-60 ${
                  showSuspendModal.action === "suspend"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {suspendLoading === showSuspendModal.email ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{showSuspendModal.action === "suspend" ? "🔒" : "✅"}</span>
                    <span>{showSuspendModal.action === "suspend" ? "تأكيد التعليق" : "تأكيد رفع التعليق"}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => { setShowSuspendModal(null); setSuspendReason(""); setSuspendResult(null); }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
