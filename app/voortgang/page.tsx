"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { useAutoTranslateList } from "@/hooks/useAutoTranslate";

interface LessonProgress {
  id: string;
  title: string;
  completedAt: string | null;
  note: string;
}

export default function VoortgangPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "ar";

  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const category = localStorage.getItem("userCategory");
    if (!email || !category) { setLoading(false); return; }

    const completed: Record<string, { title: string; completedAt: string }> =
      JSON.parse(localStorage.getItem("completedLessons") || "{}");
    const notes: Record<string, string> =
      JSON.parse(localStorage.getItem("lessonNotes") || "{}");

    fetch(`/api/lessons?category=${category}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const list: LessonProgress[] = d.lessons.map((l: any) => ({
            id: String(l.id),
            title: l.title,
            completedAt: completed[String(l.id)]?.completedAt || null,
            note: notes[String(l.id)] || "",
          }));
          setLessons(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = lessons.filter(l => l.completedAt).length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // ترجمة عناوين الدروس تلقائياً
  const translatedTitles = useAutoTranslateList(lessons.map(l => l.title), lang);

  const saveNote = (id: string) => {
    const notes: Record<string, string> = JSON.parse(localStorage.getItem("lessonNotes") || "{}");
    notes[id] = draftNote;
    localStorage.setItem("lessonNotes", JSON.stringify(notes));
    setLessons(prev => prev.map(l => l.id === id ? { ...l, note: draftNote } : l));
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const toggleComplete = (id: string, title: string) => {
    const saved: Record<string, any> = JSON.parse(localStorage.getItem("completedLessons") || "{}");
    if (saved[id]) {
      delete saved[id];
    } else {
      saved[id] = { title, completedAt: new Date().toISOString() };
    }
    localStorage.setItem("completedLessons", JSON.stringify(saved));
    setLessons(prev => prev.map(l =>
      l.id === id ? { ...l, completedAt: saved[id]?.completedAt || null } : l
    ));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : lang === "nl" ? "nl-BE" : "fr-BE", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const isLoggedIn = typeof window !== "undefined"
    ? !!localStorage.getItem("userEmail")
    : false;

  return (
    <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"} style={{ background: "#f0f0f0" }}>
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "#ffcc00", transform: "translate(-30%,-30%)" }} />
        </div>
        <div className="relative max-w-2xl md:max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-0.5">
                {lang === "ar" ? "متابعة التقدم" : lang === "nl" ? "Mijn Voortgang" : "Ma Progression"}
              </p>
              <h1 className="text-xl font-black text-white">
                {lang === "ar" ? "📊 تقدمي في الدروس" : lang === "nl" ? "📊 Lesvoortgang" : "📊 Progression des leçons"}
              </h1>
            </div>
            <button
              onClick={() => router.push("/theorie")}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              ← {lang === "ar" ? "الدروس" : lang === "nl" ? "Lessen" : "Leçons"}
            </button>
          </div>

          {/* شريط التقدم */}
          {!loading && lessons.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/70 text-xs font-bold">
                  {completedCount} / {lessons.length} {lang === "ar" ? "درس" : lang === "nl" ? "lessen" : "leçons"}
                </span>
                <span className="text-white font-black text-sm">{pct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100
                      ? "linear-gradient(90deg,#22c55e,#86efac)"
                      : "linear-gradient(90deg,#ffcc00,#fde68a)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 max-w-2xl md:max-w-4xl mx-auto w-full px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isLoggedIn ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-bold text-gray-700 mb-4">
              {lang === "ar" ? "يجب تسجيل الدخول أولاً" : lang === "nl" ? "Log eerst in" : "Connectez-vous d'abord"}
            </p>
            <button onClick={() => router.push("/theorie")}
              className="px-6 py-2.5 rounded-xl font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
              {lang === "ar" ? "الذهاب للدروس" : lang === "nl" ? "Naar lessen" : "Vers les leçons"}
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "لا توجد دروس متاحة" : lang === "nl" ? "Geen lessen beschikbaar" : "Aucune leçon disponible"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const isDone = !!lesson.completedAt;
              const isEditing = editingId === lesson.id;
              const wasSaved = savedId === lesson.id;
              const displayTitle = translatedTitles[i] || lesson.title;

              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl overflow-hidden transition-all"
                  style={{
                    border: isDone ? "1.5px solid #86efac" : "1.5px solid #e5e7eb",
                    boxShadow: isDone ? "0 2px 12px rgba(34,197,94,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* صف الدرس */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* رقم + علامة الإنجاز */}
                    <button
                      onClick={() => toggleComplete(lesson.id, lesson.title)}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                      style={{
                        background: isDone ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#f3f4f6",
                        border: isDone ? "none" : "2px solid #d1d5db",
                      }}
                      title={isDone
                        ? (lang === "ar" ? "إلغاء الإنجاز" : "Markeer als niet voltooid")
                        : (lang === "ar" ? "تحديد كمنجز" : "Markeer als voltooid")}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-black text-gray-400">{i + 1}</span>
                      )}
                    </button>

                    {/* عنوان الدرس */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm leading-snug"
                        style={{ color: isDone ? "#15803d" : "#003399", wordBreak: "break-word" }}
                      >
                        {!isDone && <span className="text-gray-400 mr-1">{i + 1}.</span>}
                        {displayTitle}
                      </p>
                      {isDone && lesson.completedAt && (
                        <p className="text-[10px] text-green-500 font-semibold mt-0.5">
                          ✓ {formatDate(lesson.completedAt)}
                        </p>
                      )}
                    </div>

                    {/* زر الملاحظات */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                        } else {
                          setEditingId(lesson.id);
                          setDraftNote(lesson.note);
                        }
                      }}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                      style={{
                        background: lesson.note ? "rgba(124,58,237,0.1)" : "#f3f4f6",
                        color: lesson.note ? "#7c3aed" : "#9ca3af",
                        border: lesson.note ? "1px solid rgba(124,58,237,0.25)" : "1px solid #e5e7eb",
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {lesson.note
                        ? (lang === "ar" ? "ملاحظة" : "Notitie")
                        : (lang === "ar" ? "أضف" : "Voeg toe")}
                    </button>
                  </div>

                  {/* خانة الملاحظات */}
                  {isEditing && (
                    <div className="px-4 pb-3 border-t border-gray-100" style={{ background: "#fafafa" }}>
                      <p className="text-xs font-bold text-gray-500 mt-2 mb-1.5">
                        {lang === "ar"
                          ? "✏️ ملاحظاتك وتلخيصك للدرس:"
                          : lang === "nl"
                          ? "✏️ Jouw notities en samenvatting:"
                          : "✏️ Vos notes et résumé:"}
                      </p>
                      <textarea
                        value={draftNote}
                        onChange={e => setDraftNote(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "اكتب ملاحظاتك أو تلخيصك للدرس هنا..."
                            : lang === "nl"
                            ? "Schrijf hier je notities of samenvatting..."
                            : "Écrivez vos notes ou résumé ici..."
                        }
                        rows={4}
                        className="w-full text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none transition-all"
                        style={{
                          border: "1.5px solid #e5e7eb",
                          background: "white",
                          color: "#1a1a1a",
                          fontFamily: "inherit",
                          lineHeight: "1.6",
                        }}
                        dir={isRtl ? "rtl" : "ltr"}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveNote(lesson.id)}
                          className="flex-1 py-2 rounded-xl font-black text-xs text-white transition-all active:scale-95"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
                        >
                          {lang === "ar" ? "💾 حفظ" : lang === "nl" ? "💾 Opslaan" : "💾 Enregistrer"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-xl font-black text-xs text-gray-500 bg-gray-100 transition-all active:scale-95"
                        >
                          {lang === "ar" ? "إلغاء" : lang === "nl" ? "Annuleren" : "Annuler"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* عرض الملاحظة المحفوظة */}
                  {!isEditing && lesson.note && (
                    <div
                      className="px-4 pb-3 border-t"
                      style={{ background: "rgba(124,58,237,0.03)", borderColor: "rgba(124,58,237,0.1)" }}
                    >
                      <p className="text-xs text-gray-400 font-bold mt-2 mb-1">
                        {lang === "ar" ? "📝 ملاحظاتك:" : lang === "nl" ? "📝 Jouw notities:" : "📝 Vos notes:"}
                      </p>
                      <p
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dir={isRtl ? "rtl" : "ltr"}
                      >
                        {lesson.note}
                      </p>
                      {wasSaved && (
                        <p className="text-xs text-green-500 font-bold mt-1">✓ {lang === "ar" ? "تم الحفظ" : "Opgeslagen"}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ملخص في الأسفل */}
        {!loading && lessons.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              {
                label: lang === "ar" ? "مكتمل" : lang === "nl" ? "Voltooid" : "Terminé",
                value: completedCount,
                color: "#22c55e",
                bg: "#f0fdf4",
              },
              {
                label: lang === "ar" ? "متبقي" : lang === "nl" ? "Resterend" : "Restant",
                value: lessons.length - completedCount,
                color: "#f97316",
                bg: "#fff7ed",
              },
              {
                label: lang === "ar" ? "ملاحظات" : lang === "nl" ? "Notities" : "Notes",
                value: lessons.filter(l => l.note).length,
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
            ].map((s, i) => (
              <div key={i} className="rounded-xl py-3 text-center" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
