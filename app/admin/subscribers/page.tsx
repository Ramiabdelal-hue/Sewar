"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminManifest from "@/components/AdminManifest";

interface Sub {
  id: string; userId: number; name: string; email: string; phone: string | null;
  paymentType: string; amount: number; subscriptionType: string; category: string;
  expiryDate: string; createdAt: string; isActive: boolean; userStatus?: string;
  lastSeen?: string | null;
  recentActivity?: { eventType: string; page: string; createdAt: string; ip: string }[];
  screenshotDetails?: { count: number; attempts: { date: string; page: string; ip: string }[] };
}

interface AllScreenshot {
  userEmail: string | null;
  page: string;
  ip: string;
  date: string;
}

const PKG: Record<string, string> = {
  theorie: "نظرية", examen: "امتحانات",
  "praktijk-lessons": "عملية-فيديو", "praktijk-exam": "عملية-خطر"
};
const PKG_COLOR: Record<string, string> = {
  theorie: "#3b82f6", examen: "#f97316",
  "praktijk-lessons": "#8b5cf6", "praktijk-exam": "#ec4899"
};

function isOnline(lastSeen?: string | null) {
  if (!lastSeen) return false;
  return (Date.now() - new Date(lastSeen).getTime()) < 5 * 60 * 1000; // 5 دقائق
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m} د`;
  if (h < 24) return `${h} س`;
  return `${d} ي`;
}

function formatTime(date: string) {
  return new Date(date).toLocaleString("ar-EG", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

function eventIcon(type: string) {
  if (type === "screenshot_attempt") return "📸";
  if (type === "login") return "🔑";
  return "👁️";
}

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [allScreenshots, setAllScreenshots] = useState<AllScreenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<Sub | null>(null);
  const [suspendModal, setSuspendModal] = useState<Sub | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "online" | "suspended" | "screenshots">("all");
  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "";

  // تحقق من localStorage
  useEffect(() => {
    if (localStorage.getItem("adminSubsLogged") === "true") {
      setIsLogged(true);
    }
  }, []);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("name", search);
      if (filterCat) p.append("category", filterCat);
      if (filterType) p.append("type", filterType);
      const res = await fetch(`/api/admin/subscribers?${p}`, { headers: { "x-admin-token": ADMIN_TOKEN } });
      const d = await res.json();
      if (d.success) {
        setSubs(d.data.subscriptions);
        setAllScreenshots(d.data.allScreenshots || []);
      }
    } catch {} finally { setLoading(false); }
  }, [search, filterCat, filterType, ADMIN_TOKEN]);

  useEffect(() => {
    if (!isLogged) return;
    fetchSubs();
    const interval = setInterval(fetchSubs, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, [isLogged, fetchSubs]);

  const handleLogin = () => {
    const u = process.env.NEXT_PUBLIC_ADMIN_USER || "sewar";
    const p = process.env.NEXT_PUBLIC_ADMIN_PASS || "70709090";
    if (user === u && pass === p) {
      localStorage.setItem("adminSubsLogged", "true");
      setIsLogged(true);
    } else alert("بيانات خاطئة");
  };

  const suspendUser = async (email: string, action: "suspend" | "unsuspend") => {
    setSuspendLoading(true);
    try {
      const r = await fetch("/api/admin/suspend-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ userEmail: email, action, reason: suspendReason })
      });
      const d = await r.json();
      if (d.success) { setSuspendModal(null); setSuspendReason(""); fetchSubs(); }
      else alert(d.message);
    } catch { alert("خطأ في الاتصال"); }
    finally { setSuspendLoading(false); }
  };

  if (!isLogged) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#0066cc,#004499)" }}>🔐</div>
          <h1 className="text-xl font-black text-gray-800">لوحة المشتركين</h1>
        </div>
        <input type="text" placeholder="اسم المستخدم" className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 text-right focus:border-blue-500 focus:outline-none" value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <input type="password" placeholder="كلمة المرور" className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 text-right focus:border-blue-500 focus:outline-none" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <button onClick={handleLogin} className="w-full py-3 rounded-xl font-black text-white" style={{ background: "linear-gradient(135deg,#0066cc,#004499)" }}>دخول</button>
      </div>
    </div>
  );

  // فلترة
  const onlineCount = subs.filter(s => isOnline(s.lastSeen)).length;
  const suspendedCount = subs.filter(s => s.userStatus === "suspended").length;
  const screenshotCount = allScreenshots.length;

  const filtered = subs.filter(s => {
    if (tab === "online" && !isOnline(s.lastSeen)) return false;
    if (tab === "suspended" && s.userStatus !== "suspended") return false;
    if (tab === "screenshots" && (s.screenshotDetails?.count || 0) === 0) return false;
    if (filterStatus === "active" && (s.userStatus === "suspended" || new Date(s.expiryDate) <= new Date())) return false;
    if (filterStatus === "expired" && new Date(s.expiryDate) > new Date()) return false;
    return true;
  });

  const totalRevenue = subs.reduce((t, s) => t + s.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminManifest />

      {/* Header */}
      <div className="sticky top-0 z-20 shadow-sm" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/questions")} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-white font-black text-base">👥 المشتركون</h1>
              <p className="text-white/40 text-xs">{subs.length} اشتراك · €{totalRevenue}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onlineCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-black">{onlineCount} online</span>
              </div>
            )}
            <button onClick={fetchSubs} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition text-lg">🔄</button>
            <button onClick={() => { localStorage.removeItem("adminSubsLogged"); setIsLogged(false); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition text-lg">🚪</button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-7xl mx-auto px-4 pb-3 grid grid-cols-4 gap-2">
          {[
            { label: "المشتركون", value: subs.length, icon: "👥", color: "#3b82f6" },
            { label: "Online الآن", value: onlineCount, icon: "🟢", color: "#22c55e" },
            { label: "الإيرادات", value: `€${totalRevenue}`, icon: "💶", color: "#f59e0b" },
            { label: "معلقون", value: suspendedCount, icon: "🔒", color: "#ef4444" },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-lg">{s.icon}</div>
              <div className="text-white font-black text-sm">{s.value}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "الكل", count: subs.length, color: "#3b82f6" },
            { key: "online", label: "🟢 Online", count: onlineCount, color: "#22c55e" },
            { key: "suspended", label: "🔒 معلق", count: suspendedCount, color: "#ef4444" },
            { key: "screenshots", label: "📸 Screenshots", count: screenshotCount, color: "#f97316" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={tab === t.key
                ? { background: t.color, color: "white", boxShadow: `0 4px 12px ${t.color}40` }
                : { background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb" }
              }>
              {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={tab === t.key ? { background: "rgba(255,255,255,0.25)" } : { background: "#f3f4f6" }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="🔍 ابحث بالاسم أو البريد..." className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">كل الفئات</option>
              <option value="A">A - موتور</option>
              <option value="B">B - سيارة</option>
              <option value="C">C - شاحنة</option>
            </select>
            <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">كل الأنواع</option>
              <option value="theorie">نظرية</option>
              <option value="examen">امتحانات</option>
              <option value="praktijk-lessons">عملية-فيديو</option>
              <option value="praktijk-exam">عملية-خطر</option>
            </select>
          </div>
        </div>

        {/* ══ SCREENSHOTS TAB ══════════════════════════════════════════ */}
          {tab === "screenshots" && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: "#fff7ed" }}>
                  <h2 className="font-black text-orange-700 text-sm flex items-center gap-2">
                    📸 جميع محاولات Screenshot
                  </h2>
                  <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">{allScreenshots.length}</span>
                </div>
                {allScreenshots.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-gray-500 font-bold">لا توجد محاولات Screenshot</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {allScreenshots.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition">
                        <span className="text-2xl flex-shrink-0">📸</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {s.userEmail ? (
                              <span className="text-orange-600">{s.userEmail}</span>
                            ) : (
                              <span className="text-gray-400 italic">زائر غير مسجل</span>
                            )}
                          </p>
                          <p className="text-gray-400 text-xs truncate">📄 {s.page} · 🌐 {s.ip}</p>
                        </div>
                        <span className="text-gray-400 text-xs flex-shrink-0 font-mono">{formatTime(s.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SUBSCRIBERS LIST ══════════════════════════════════════════ */}
          {tab !== "screenshots" && (
            <>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 font-bold">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => {
              const online = isOnline(sub.lastSeen);
              const expired = new Date(sub.expiryDate) <= new Date();
              const suspended = sub.userStatus === "suspended";
              const shots = sub.screenshotDetails?.count || 0;
              const pkgColor = PKG_COLOR[sub.subscriptionType] || "#6b7280";

              return (
                <div key={sub.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(selected?.id === sub.id ? null : sub)}>

                  {/* Main Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">

                      {/* Avatar + Online */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
                          style={{ background: `linear-gradient(135deg, ${pkgColor}, ${pkgColor}99)` }}>
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        {online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-800 text-sm">{sub.name}</span>
                          {online && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold animate-pulse">🟢 Online</span>}
                          {suspended && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">🔒 معلق</span>}
                          {!suspended && expired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">منتهي</span>}
                          {!suspended && !expired && !online && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">نشط</span>}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">{sub.email}</p>
                        {sub.phone && <p className="text-gray-400 text-xs">📱 {sub.phone}</p>}
                      </div>

                      {/* Right Side */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white" style={{ background: pkgColor }}>
                          {PKG[sub.subscriptionType]} {sub.category}
                        </span>
                        <span className="text-xs font-black text-gray-600">€{sub.amount}</span>
                        {shots > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${shots > 3 ? "bg-red-100 text-red-700 animate-pulse" : "bg-orange-100 text-orange-700"}`}>
                            📸 {shots}{shots > 3 ? " ⚠️" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Seen */}
                    {sub.lastSeen && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                        <span>⏱</span>
                        <span>آخر نشاط: {online ? "الآن" : timeAgo(sub.lastSeen)} · {formatTime(sub.lastSeen)}</span>
                      </div>
                    )}

                    {/* Expiry */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <span>📅</span>
                      <span>ينتهي: {new Date(sub.expiryDate).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selected?.id === sub.id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">

                      {/* Activity Timeline */}
                      {sub.recentActivity && sub.recentActivity.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-gray-600 mb-2 flex items-center gap-1">
                            📊 آخر النشاطات
                          </h4>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {sub.recentActivity.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                                <span className="text-base flex-shrink-0">{eventIcon(a.eventType)}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-gray-700 truncate block">{a.page || "/"}</span>
                                  <span className="text-gray-400">{a.ip}</span>
                                </div>
                                <span className="text-gray-400 flex-shrink-0 font-mono">{formatTime(a.createdAt)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Screenshot Details */}
                      {shots > 0 && sub.screenshotDetails?.attempts && (
                        <div>
                          <h4 className="text-xs font-black text-red-600 mb-2 flex items-center gap-1">
                            📸 محاولات Screenshot ({shots})
                          </h4>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {sub.screenshotDetails.attempts.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                                <span className="text-base">📸</span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-red-700 truncate block">{a.page}</span>
                                  <span className="text-red-400">{a.ip}</span>
                                </div>
                                <span className="text-red-400 flex-shrink-0 font-mono">{formatTime(a.date)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {suspended ? (
                          <button onClick={e => { e.stopPropagation(); setSuspendModal({ ...sub, userStatus: "unsuspend" as any }); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-green-100 text-green-700 hover:bg-green-200 transition">
                            ✅ رفع التعليق
                          </button>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); setSuspendModal(sub); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-purple-100 text-purple-700 hover:bg-purple-200 transition">
                            🔒 تعليق الحساب
                          </button>
                        )}
                        <a href={`mailto:${sub.email}`} onClick={e => e.stopPropagation()}
                          className="flex-1 py-2.5 rounded-xl text-sm font-black bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-center">
                          📧 إرسال إيميل
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
          </>
          )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60" onClick={() => setSuspendModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{(suspendModal.userStatus as any) === "unsuspend" ? "✅" : "🔒"}</div>
              <h3 className="font-black text-gray-800 text-lg">
                {(suspendModal.userStatus as any) === "unsuspend" ? "رفع التعليق" : "تعليق الحساب"}
              </h3>
              <p className="text-gray-500 text-sm mt-1">{suspendModal.name}</p>
            </div>
            {(suspendModal.userStatus as any) !== "unsuspend" && (
              <textarea
                placeholder="سبب التعليق (اختياري)..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none resize-none mb-4"
                rows={3} value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(null)} className="flex-1 py-3 rounded-xl font-black text-sm bg-gray-100 text-gray-600">إلغاء</button>
              <button
                onClick={() => suspendUser(suspendModal.email, (suspendModal.userStatus as any) === "unsuspend" ? "unsuspend" : "suspend")}
                disabled={suspendLoading}
                className="flex-1 py-3 rounded-xl font-black text-sm text-white disabled:opacity-50"
                style={{ background: (suspendModal.userStatus as any) === "unsuspend" ? "#22c55e" : "#7c3aed" }}>
                {suspendLoading ? "..." : (suspendModal.userStatus as any) === "unsuspend" ? "رفع التعليق" : "تعليق"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
