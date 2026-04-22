"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminManifest from "@/components/AdminManifest";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubscriptionRow {
  id: string; userId: number; name: string; email: string; phone: string | null;
  paymentType: string; amount: number; subscriptionType: string; category: string;
  expiryDate: string; createdAt: string; isActive: boolean; userStatus?: string;
  screenshotDetails?: { count: number; attempts: { date: string; page: string; ip: string }[] };
}
interface Stats { totalSubscribers: number; totalRevenue: number; categoryStats: Record<string,number>; totalSubscriptions: number; }
interface Warnings { suspiciousScreenshots: number; suspiciousUsers: { name:string; email:string; phone:string|null; attempts:number }[]; }
interface ActivityStats {
  todayVisitors:number; todayLoggedIn:number; weekVisitors:number; totalUniqueVisitors:number;
  screenshotAttempts:number; topPages:{page:string;count:number}[]; recentActivity:any[]; recentScreenshots:any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PKG: Record<string,string> = { theorie:"دروس نظرية", examen:"امتحانات", "praktijk-lessons":"دروس عملية - فيديوهات", "praktijk-exam":"دروس عملية - إدراك المخاطر" };
const PAY: Record<string,string> = { cash:"نقدي", card:"بطاقة", bancontact:"Bancontact", payconiq:"Payconiq", bank_transfer:"تحويل بنكي" };

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
const NAV = [
  { key:"subscribers", icon:"👥", label:"المشتركون" },
  { key:"screenshots", icon:"📸", label:"محاولات Screenshot" },
  { key:"activity",    icon:"📊", label:"الزوار والنشاط" },
];

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(""); const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"subscribers"|"screenshots"|"activity">("subscribers");

  // data
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [stats, setStats] = useState<Stats|null>(null);
  const [warnings, setWarnings] = useState<Warnings|null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats|null>(null);
  const [availableNames, setAvailableNames] = useState<{name:string;email:string}[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [searchName, setSearchName] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchType, setSearchType] = useState("");

  // modals
  const [selectedScreenshots, setSelectedScreenshots] = useState<any>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState("");

  // action states
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{success:boolean;message:string}|null>(null);
  const [suspendLoading, setSuspendLoading] = useState<string|null>(null);
  const [suspendResult, setSuspendResult] = useState<{success:boolean;message:string}|null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    const u = process.env.NEXT_PUBLIC_ADMIN_USER || "sewar";
    const p = process.env.NEXT_PUBLIC_ADMIN_PASS || "70709090";
    if (user === u && password === p) { setIsLogged(true); fetchSubscribers(); fetchActivityStats(); }
    else alert("بيانات الدخول غير صحيحة");
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (searchName) p.append("name", searchName);
      if (searchMonth) p.append("month", searchMonth);
      if (searchCategory) p.append("category", searchCategory);
      if (searchType) p.append("type", searchType);
      const res = await fetch(`/api/admin/subscribers?${p}`);
      const d = await res.json();
      if (d.success) { setSubscriptions(d.data.subscriptions); setStats(d.data.stats); setWarnings(d.data.warnings); }
    } catch {} finally { setLoading(false); }
  };

  const fetchActivityStats = async () => {
    try { const r = await fetch("/api/activity"); const d = await r.json(); if (d.success) setActivityStats(d.stats); } catch {}
  };

  useEffect(() => { if (isLogged) { fetchSubscribers(); fetch("/api/admin/subscribers?getNames=true").then(r=>r.json()).then(d=>{ if(d.success) setAvailableNames(d.names); }); } }, [isLogged]);
  useEffect(() => { if (isLogged) fetchSubscribers(); }, [searchName, searchMonth, searchCategory, searchType]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const sendWarningEmail = async (email: string) => {
    setEmailSending(true); setEmailResult(null);
    try {
      const r = await fetch("/api/admin/send-warning", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({userEmail:email}) });
      const d = await r.json();
      setEmailResult({success:d.success, message:d.message});
    } catch { setEmailResult({success:false, message:"خطأ في الاتصال"}); }
    finally { setEmailSending(false); }
  };

  const suspendUser = async (email: string, action: "suspend"|"unsuspend") => {
    setSuspendLoading(email); setSuspendResult(null);
    try {
      const r = await fetch("/api/admin/suspend-user", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({userEmail:email, action, reason:suspendReason}) });
      const d = await r.json();
      setSuspendResult({success:d.success, message:d.message});
      if (d.success) { setShowSuspendModal(null); setSuspendReason(""); setTimeout(fetchSubscribers, 400); }
    } catch { setSuspendResult({success:false, message:"خطأ في الاتصال"}); }
    finally { setSuspendLoading(null); }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isLogged) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)"}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl" style={{background:"linear-gradient(135deg,#0066cc,#004499)"}}>🔐</div>
          <h1 className="text-2xl font-black text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-500 text-sm mt-1">Sewar RijbewijsOnline</p>
        </div>
        <input type="text" placeholder="اسم المستخدم" className="w-full p-4 border-2 border-gray-200 rounded-xl mb-3 focus:border-blue-500 focus:outline-none text-right" value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        <input type="password" placeholder="كلمة المرور" className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 focus:border-blue-500 focus:outline-none text-right" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        <button onClick={handleLogin} className="w-full py-4 rounded-xl font-black text-white text-lg transition hover:opacity-90" style={{background:"linear-gradient(135deg,#0066cc,#004499)"}}>دخول</button>
      </div>
    </div>
  );

  // ── Suspended count ───────────────────────────────────────────────────────
  const suspendedCount = subscriptions.filter(s => s.userStatus === "suspended").length;

  return (
    <div className="min-h-screen flex" style={{background:"#f0f4f8"}} dir="rtl">
      <AdminManifest />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{background:"linear-gradient(180deg,#0f172a 0%,#1e3a5f 100%)", minHeight:"100vh"}}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:"linear-gradient(135deg,#0066cc,#004499)"}}>🚗</div>
            <div>
              <p className="text-white font-black text-sm">Sewar</p>
              <p className="text-white/50 text-xs">RijbewijsOnline</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(n => (
            <button key={n.key} onClick={()=>{ setActiveTab(n.key as any); if(n.key==="activity") fetchActivityStats(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab===n.key ? "bg-white text-blue-700 shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <span className="text-lg">{n.icon}</span>
              <span>{n.label}</span>
              {n.key==="screenshots" && warnings && warnings.suspiciousScreenshots > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">{warnings.suspiciousScreenshots}</span>
              )}
              {n.key==="subscribers" && suspendedCount > 0 && (
                <span className="mr-auto bg-purple-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{suspendedCount} معلق</span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
            <button onClick={()=>router.push("/admin/questions")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all">
              <span className="text-lg">❓</span><span>إدارة الأسئلة</span>
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={()=>setIsLogged(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
            <span className="text-lg">🚪</span><span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-gray-800">
              {activeTab==="subscribers" ? "👥 المشتركون" : activeTab==="screenshots" ? "📸 محاولات Screenshot" : "📊 الزوار والنشاط"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {activeTab==="subscribers" ? `${subscriptions.length} اشتراك` : activeTab==="screenshots" ? `${warnings?.suspiciousScreenshots||0} مشترك مشبوه` : "إحصائيات الزيارات"}
            </p>
          </div>
          <button onClick={fetchSubscribers} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition">
            🔄 تحديث
          </button>
        </div>

        <div className="p-8">

          {/* ══ TAB: SUBSCRIBERS ══════════════════════════════════════════ */}
          {activeTab === "subscribers" && (
            <div className="space-y-6">

              {/* Warning Banner */}
              {warnings && warnings.suspiciousScreenshots > 0 && (
                <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-black text-lg mb-1">تحذير أمني: محاولات Screenshot مشبوهة</h3>
                      <p className="text-white/80 text-sm mb-3">{warnings.suspiciousScreenshots} مشترك تجاوزوا 3 محاولات</p>
                      <div className="grid gap-2">
                        {warnings.suspiciousUsers.map((u,i) => (
                          <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">{u.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="font-bold text-sm">{u.name}</p>
                                <p className="text-white/60 text-xs">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-center"><div className="text-2xl font-black">{u.attempts}</div><div className="text-white/60 text-xs">محاولة</div></div>
                              <button onClick={()=>sendWarningEmail(u.email)} disabled={emailSending} className="px-3 py-2 bg-white text-red-600 rounded-lg text-xs font-black hover:bg-red-50 transition disabled:opacity-60">📧 إيميل</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {label:"إجمالي المشتركين", value:stats.totalSubscribers, icon:"👥", color:"#0066cc"},
                    {label:"إجمالي الإيرادات", value:`€${stats.totalRevenue}`, icon:"💶", color:"#16a34a"},
                    {label:"إجمالي الاشتراكات", value:stats.totalSubscriptions, icon:"📋", color:"#7c3aed"},
                    {label:"حسابات معلقة", value:suspendedCount, icon:"🔒", color:"#dc2626"},
                  ].map((c,i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{c.icon}</span>
                        <div className="w-2 h-2 rounded-full" style={{background:c.color}}/>
                      </div>
                      <div className="text-2xl font-black text-gray-800">{c.value}</div>
                      <div className="text-gray-500 text-sm mt-1">{c.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-black text-gray-700 mb-4 flex items-center gap-2">🔍 فلاتر البحث</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الاسم أو البريد</label>
                    <input type="text" list="names-list" placeholder="ابحث..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchName} onChange={e=>setSearchName(e.target.value)} />
                    <datalist id="names-list">
                      {availableNames.map((n,i) => <option key={i} value={n.name}>{n.email}</option>)}
                      {availableNames.map((n,i) => <option key={`e${i}`} value={n.email}>{n.name}</option>)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الشهر</label>
                    <input type="month" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchMonth} onChange={e=>setSearchMonth(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نوع الاشتراك</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchType} onChange={e=>setSearchType(e.target.value)}>
                      <option value="">جميع الأنواع</option>
                      <option value="theorie">دروس نظرية</option>
                      <option value="examen">امتحانات</option>
                      <option value="praktijk-lessons">دروس عملية - فيديوهات</option>
                      <option value="praktijk-exam">دروس عملية - إدراك المخاطر</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الفئة</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchCategory} onChange={e=>setSearchCategory(e.target.value)}>
                      <option value="">جميع الفئات</option>
                      <option value="A">فئة A</option>
                      <option value="B">فئة B</option>
                      <option value="C">فئة C</option>
                    </select>
                  </div>
                </div>
                {(searchName||searchMonth||searchType||searchCategory) && (
                  <button onClick={()=>{setSearchName("");setSearchMonth("");setSearchType("");setSearchCategory("");}} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">✕ مسح الفلاتر</button>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800">قائمة الاشتراكات</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">{subscriptions.length} اشتراك</span>
                </div>

                {loading ? (
                  <div className="p-16 text-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-gray-500 font-medium">جاري التحميل...</p></div>
                ) : subscriptions.length === 0 ? (
                  <div className="p-16 text-center"><div className="text-5xl mb-3">📭</div><p className="text-gray-500 font-bold">لا توجد نتائج</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["المشترك","الهاتف","الاشتراك","الفئة","الدفع","المبلغ","الانتهاء","تاريخ الاشتراك","الحالة","📸","⚙️"].map((h,i) => (
                            <th key={i} className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {subscriptions.map(sub => {
                          const isSuspended = sub.userStatus === "suspended";
                          const isExpired = new Date(sub.expiryDate) <= new Date();
                          const shots = sub.screenshotDetails?.count || 0;
                          return (
                            <tr key={sub.id} className={`hover:bg-gray-50 transition ${isSuspended ? "bg-purple-50/50" : ""}`}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{background:"linear-gradient(135deg,#0066cc,#004499)"}}>{sub.name.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{sub.name}</p>
                                    <p className="text-gray-400 text-xs">{sub.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sub.phone||<span className="text-gray-300">—</span>}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">{PKG[sub.subscriptionType]||sub.subscriptionType}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">فئة {sub.category}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">{PAY[sub.paymentType]||sub.paymentType}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="font-black text-gray-800 text-sm">€{sub.amount}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{new Date(sub.expiryDate).toLocaleDateString("ar-EG")}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{new Date(sub.createdAt).toLocaleDateString("ar-EG")}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {isSuspended
                                  ? <span className="px-2 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-700">🔒 معلق</span>
                                  : isExpired
                                    ? <span className="px-2 py-1 rounded-lg text-xs font-black bg-red-100 text-red-700">منتهي</span>
                                    : <span className="px-2 py-1 rounded-lg text-xs font-black bg-green-100 text-green-700">✅ نشط</span>
                                }
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {shots > 0
                                  ? <button onClick={()=>setSelectedScreenshots(sub)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition ${shots>3?"bg-red-100 text-red-700 hover:bg-red-200 animate-pulse":"bg-orange-100 text-orange-700 hover:bg-orange-200"}`}>
                                      📸 {shots}{shots>3&&" ⚠️"}
                                    </button>
                                  : <span className="text-gray-300 text-xs">—</span>
                                }
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {isSuspended
                                  ? <button onClick={()=>setShowSuspendModal({...sub,action:"unsuspend"})} className="px-3 py-1.5 rounded-lg text-xs font-black bg-green-100 text-green-700 hover:bg-green-200 transition">✅ رفع التعليق</button>
                                  : <button onClick={()=>setShowSuspendModal({...sub,action:"suspend"})} className="px-3 py-1.5 rounded-lg text-xs font-black bg-purple-100 text-purple-700 hover:bg-purple-200 transition">🔒 تعليق</button>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ TAB: SUBSCRIBERS ══════════════════════════════════════════ */}
          {activeTab === "subscribers" && (
            <div className="space-y-6">

              {/* Warning Banner */}
              {warnings && warnings.suspiciousScreenshots > 0 && (
                <div className="rounded-2xl p-5 text-white" style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-black text-lg mb-1">تحذير أمني: محاولات Screenshot مشبوهة</h3>
                      <p className="text-white/80 text-sm mb-3">{warnings.suspiciousScreenshots} مشترك تجاوزوا 3 محاولات</p>
                      <div className="grid gap-2">
                        {warnings.suspiciousUsers.map((u,i) => (
                          <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">{u.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="font-bold text-sm">{u.name}</p>
                                <p className="text-white/60 text-xs">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-center"><div className="text-2xl font-black">{u.attempts}</div><div className="text-white/60 text-xs">محاولة</div></div>
                              <button onClick={()=>sendWarningEmail(u.email)} disabled={emailSending} className="px-3 py-2 bg-white text-red-600 rounded-lg text-xs font-black hover:bg-red-50 transition disabled:opacity-60">📧 إيميل</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {label:"إجمالي المشتركين", value:stats.totalSubscribers, icon:"👥", color:"#0066cc"},
                    {label:"إجمالي الإيرادات", value:`€${stats.totalRevenue}`, icon:"💶", color:"#16a34a"},
                    {label:"إجمالي الاشتراكات", value:stats.totalSubscriptions, icon:"📋", color:"#7c3aed"},
                    {label:"حسابات معلقة", value:suspendedCount, icon:"🔒", color:"#dc2626"},
                  ].map((c,i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{c.icon}</span>
                        <div className="w-2 h-2 rounded-full" style={{background:c.color}}/>
                      </div>
                      <div className="text-2xl font-black text-gray-800">{c.value}</div>
                      <div className="text-gray-500 text-sm mt-1">{c.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-black text-gray-700 mb-4">🔍 فلاتر البحث</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الاسم أو البريد</label>
                    <input type="text" list="names-list" placeholder="ابحث..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchName} onChange={e=>setSearchName(e.target.value)} />
                    <datalist id="names-list">
                      {availableNames.map((n,i) => <option key={i} value={n.name}>{n.email}</option>)}
                      {availableNames.map((n,i) => <option key={`e${i}`} value={n.email}>{n.name}</option>)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الشهر</label>
                    <input type="month" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchMonth} onChange={e=>setSearchMonth(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نوع الاشتراك</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchType} onChange={e=>setSearchType(e.target.value)}>
                      <option value="">جميع الأنواع</option>
                      <option value="theorie">دروس نظرية</option>
                      <option value="examen">امتحانات</option>
                      <option value="praktijk-lessons">دروس عملية - فيديوهات</option>
                      <option value="praktijk-exam">دروس عملية - إدراك المخاطر</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">الفئة</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition" value={searchCategory} onChange={e=>setSearchCategory(e.target.value)}>
                      <option value="">جميع الفئات</option>
                      <option value="A">فئة A</option>
                      <option value="B">فئة B</option>
                      <option value="C">فئة C</option>
                    </select>
                  </div>
                </div>
                {(searchName||searchMonth||searchType||searchCategory) && (
                  <button onClick={()=>{setSearchName("");setSearchMonth("");setSearchType("");setSearchCategory("");}} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">✕ مسح الفلاتر</button>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800">قائمة الاشتراكات</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">{subscriptions.length} اشتراك</span>
                </div>
                {loading ? (
                  <div className="p-16 text-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-gray-500 font-medium">جاري التحميل...</p></div>
                ) : subscriptions.length === 0 ? (
                  <div className="p-16 text-center"><div className="text-5xl mb-3">📭</div><p className="text-gray-500 font-bold">لا توجد نتائج</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["المشترك","الهاتف","الاشتراك","الفئة","الدفع","المبلغ","الانتهاء","تاريخ الاشتراك","الحالة","📸","⚙️"].map((h,i) => (
                            <th key={i} className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {subscriptions.map(sub => {
                          const isSuspended = sub.userStatus === "suspended";
                          const isExpired = new Date(sub.expiryDate) <= new Date();
                          const shots = sub.screenshotDetails?.count || 0;
                          return (
                            <tr key={sub.id} className={`hover:bg-gray-50 transition ${isSuspended ? "bg-purple-50/50" : ""}`}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{background:"linear-gradient(135deg,#0066cc,#004499)"}}>{sub.name.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{sub.name}</p>
                                    <p className="text-gray-400 text-xs">{sub.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sub.phone || "—"}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">{PKG[sub.subscriptionType]||sub.subscriptionType}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700">فئة {sub.category}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">{PAY[sub.paymentType]||sub.paymentType}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="font-black text-gray-800 text-sm">€{sub.amount}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{new Date(sub.expiryDate).toLocaleDateString("ar-EG")}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{new Date(sub.createdAt).toLocaleDateString("ar-EG")}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {isSuspended ? <span className="px-2 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-700">🔒 معلق</span>
                                  : isExpired ? <span className="px-2 py-1 rounded-lg text-xs font-black bg-red-100 text-red-700">منتهي</span>
                                  : <span className="px-2 py-1 rounded-lg text-xs font-black bg-green-100 text-green-700">✅ نشط</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {shots > 0
                                  ? <button onClick={()=>setSelectedScreenshots(sub)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition ${shots>3?"bg-red-100 text-red-700 hover:bg-red-200 animate-pulse":"bg-orange-100 text-orange-700 hover:bg-orange-200"}`}>📸 {shots}{shots>3&&" ⚠️"}</button>
                                  : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {isSuspended
                                  ? <button onClick={()=>setShowSuspendModal({...sub,action:"unsuspend"})} className="px-3 py-1.5 rounded-lg text-xs font-black bg-green-100 text-green-700 hover:bg-green-200 transition">✅ رفع التعليق</button>
                                  : <button onClick={()=>setShowSuspendModal({...sub,action:"suspend"})} className="px-3 py-1.5 rounded-lg text-xs font-black bg-purple-100 text-purple-700 hover:bg-purple-200 transition">🔒 تعليق</button>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ TAB: SCREENSHOTS ══════════════════════════════════════════ */}
          {activeTab === "screenshots" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* مشتركون مشبوهون */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <h3 className="font-black text-gray-800">مشتركون مشبوهون (أكثر من 3 محاولات)</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {subscriptions.filter(s=>(s.screenshotDetails?.count||0)>3).length === 0
                      ? <p className="text-center text-gray-400 py-8">✅ لا يوجد مشتركون مشبوهون</p>
                      : subscriptions.filter(s=>(s.screenshotDetails?.count||0)>3).map((s,i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center font-black text-red-700">{s.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                              <p className="text-gray-500 text-xs">{s.email}</p>
                              {s.phone && <p className="text-gray-500 text-xs">📱 {s.phone}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-center">
                              <div className="text-2xl font-black text-red-600">{s.screenshotDetails?.count}</div>
                              <div className="text-xs text-gray-500">محاولة</div>
                            </div>
                            <button onClick={()=>setSelectedScreenshots(s)} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-black hover:bg-red-200 transition">تفاصيل</button>
                            <button onClick={()=>sendWarningEmail(s.email)} disabled={emailSending} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-black hover:bg-orange-200 transition disabled:opacity-60">📧</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* آخر المحاولات */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <span className="text-xl">📸</span>
                    <h3 className="font-black text-gray-800">آخر المحاولات (30 يوم)</h3>
                    {activityStats && <span className="mr-auto bg-red-100 text-red-700 text-xs font-black px-2 py-1 rounded-full">{activityStats.screenshotAttempts} محاولة</span>}
                  </div>
                  <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {!activityStats ? (
                      <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
                    ) : activityStats.recentScreenshots.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">✅ لا توجد محاولات</div>
                    ) : activityStats.recentScreenshots.map((s,i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-red-400 text-lg flex-shrink-0">📸</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{s.userEmail||"زائر غير مسجل"}</p>
                          <p className="text-xs text-gray-400 truncate">{s.page} · IP: {s.ip}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{new Date(s.createdAt).toLocaleString("ar-EG")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: ACTIVITY ═════════════════════════════════════════════ */}
          {activeTab === "activity" && activityStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {label:"زوار اليوم", value:activityStats.todayVisitors, icon:"👁", color:"from-blue-500 to-blue-600"},
                  {label:"مسجلون اليوم", value:activityStats.todayLoggedIn, icon:"🔐", color:"from-green-500 to-green-600"},
                  {label:"زوار آخر 7 أيام", value:activityStats.weekVisitors, icon:"📅", color:"from-purple-500 to-purple-600"},
                  {label:"إجمالي الزوار", value:activityStats.totalUniqueVisitors, icon:"🌍", color:"from-orange-500 to-orange-600"},
                ].map((s,i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-sm`}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-3xl font-black">{s.value}</div>
                    <div className="text-white/80 text-sm mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-800 mb-4">📄 أكثر الصفحات زيارة</h3>
                  <div className="space-y-2">
                    {activityStats.topPages.map((p,i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i+1}</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{p.page}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-800 mb-4">🕐 آخر النشاطات</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {activityStats.recentActivity.map((a,i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.eventType==="screenshot_attempt"?"bg-red-500":"bg-green-500"}`}/>
                        <span className="text-xs text-gray-400 flex-shrink-0">{new Date(a.createdAt).toLocaleString("ar-EG")}</span>
                        <span className="text-xs font-bold text-gray-700 flex-shrink-0">{a.eventType==="screenshot_attempt"?"📸":"👁"}</span>
                        <span className="text-xs text-gray-500 truncate">{a.page||"—"}</span>
                        {a.userEmail && <span className="text-xs text-blue-500 truncate">{a.userEmail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══ MODAL: Screenshot Details ═════════════════════════════════════ */}
      {selectedScreenshots && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={()=>{setSelectedScreenshots(null);setEmailResult(null);}}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className={`p-6 border-b ${(selectedScreenshots.screenshotDetails?.count||0)>3?"bg-red-50 border-red-200":"bg-orange-50 border-orange-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📸</span>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">محاولات Screenshot</h3>
                    <p className="text-sm text-gray-500">{selectedScreenshots.screenshotDetails?.count||0} محاولة مسجلة</p>
                  </div>
                </div>
                <button onClick={()=>{setSelectedScreenshots(null);setEmailResult(null);}} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:"الاسم", value:selectedScreenshots.name},
                  {label:"البريد", value:selectedScreenshots.email},
                  {label:"الهاتف", value:selectedScreenshots.phone||"غير متوفر"},
                  {label:"الاشتراك", value:PKG[selectedScreenshots.subscriptionType]||selectedScreenshots.subscriptionType},
                ].map((f,i) => (
                  <div key={i} className="bg-white rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                    <p className="font-bold text-gray-800 text-sm">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-64 overflow-y-auto">
              <h4 className="font-bold text-gray-600 text-sm mb-3">تفاصيل المحاولات</h4>
              <div className="space-y-2">
                {selectedScreenshots.screenshotDetails?.attempts.map((a:any,i:number) => (
                  <div key={i} className={`p-3 rounded-xl border ${i>=3?"bg-red-50 border-red-200":"bg-orange-50 border-orange-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i>=3?"bg-red-200 text-red-800":"bg-orange-200 text-orange-800"}`}>{i+1}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{new Date(a.date).toLocaleString("ar-EG",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})}</p>
                        <p className="text-xs text-gray-500 mt-0.5">🌐 {a.page} · IP: {a.ip}</p>
                      </div>
                      {i>=3 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">⚠️ مشبوه</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t">
              {emailResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mb-3 ${emailResult.success?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
                  {emailResult.success?"✅":"❌"} {emailResult.message}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>sendWarningEmail(selectedScreenshots.email)} disabled={emailSending} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white transition disabled:opacity-60" style={{background:"linear-gradient(135deg,#f97316,#dc2626)"}}>
                  {emailSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : "📧"} إرسال إيميل تحذيري
                </button>
                <button onClick={()=>{setSelectedScreenshots(null);setEmailResult(null);}} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Suspend ════════════════════════════════════════════════ */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={()=>{setShowSuspendModal(null);setSuspendReason("");setSuspendResult(null);}}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className={`p-6 ${showSuspendModal.action==="suspend"?"bg-purple-600":"bg-green-600"}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{showSuspendModal.action==="suspend"?"🔒":"✅"}</span>
                <div>
                  <h3 className="text-xl font-black text-white">{showSuspendModal.action==="suspend"?"تعليق الاشتراك مؤقتاً":"رفع التعليق"}</h3>
                  <p className="text-white/80 text-sm">{showSuspendModal.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">الاسم</span><span className="font-bold">{showSuspendModal.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">البريد</span><span className="font-bold text-blue-600">{showSuspendModal.email}</span></div>
                {showSuspendModal.phone && <div className="flex justify-between"><span className="text-gray-500">الهاتف</span><span className="font-bold">{showSuspendModal.phone}</span></div>}
              </div>
              {showSuspendModal.action==="suspend" && (
                <>
                  <label className="block text-sm font-bold text-gray-700 mb-2">سبب التعليق (اختياري)</label>
                  <textarea value={suspendReason} onChange={e=>setSuspendReason(e.target.value)} placeholder="مثال: محاولات متكررة لأخذ لقطات شاشة..." rows={3} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm resize-none"/>
                  <p className="text-xs text-gray-400 mt-2">⚠️ سيتم إرسال إيميل إشعار وإجبار المشترك على تسجيل الخروج فوراً</p>
                </>
              )}
              {showSuspendModal.action==="unsuspend" && <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3">✅ سيتم رفع التعليق وإعادة تفعيل الاشتراك فوراً</p>}
              {suspendResult && (
                <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${suspendResult.success?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
                  {suspendResult.success?"✅":"❌"} {suspendResult.message}
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button onClick={()=>suspendUser(showSuspendModal.email,showSuspendModal.action)} disabled={suspendLoading===showSuspendModal.email} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white transition disabled:opacity-60 ${showSuspendModal.action==="suspend"?"bg-purple-600 hover:bg-purple-700":"bg-green-600 hover:bg-green-700"}`}>
                {suspendLoading===showSuspendModal.email ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <>{showSuspendModal.action==="suspend"?"🔒 تأكيد التعليق":"✅ تأكيد رفع التعليق"}</>}
              </button>
              <button onClick={()=>{setShowSuspendModal(null);setSuspendReason("");setSuspendResult(null);}} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
