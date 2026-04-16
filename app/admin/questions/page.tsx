"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import adminTranslations from "@/locales/admin.json";
import FileUploader from "@/components/FileUploader";

interface Question {
  id: number;
  text: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
  videoUrls?: string[];
  audioUrl?: string;
}

// Component إدارة الأسعار
function PricesManager({ onBack }: { onBack: () => void }) {
  const categories = ["A", "B", "C"];
  const [selectedCat, setSelectedCat] = useState("B");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // أسعار لكل فئة: theorie_A_2w, theorie_A_1m, ...
  const defaultPrices: Record<string, string> = {};
  categories.forEach(cat => {
    defaultPrices[`theorie_${cat}_2w`] = "25";
    defaultPrices[`theorie_${cat}_1m`] = "50";
    defaultPrices[`examen_${cat}_2w`] = "25";
    defaultPrices[`examen_${cat}_1m`] = "50";
    defaultPrices[`praktijk_${cat}_training`] = "49";
    defaultPrices[`praktijk_${cat}_hazard`] = "39";
  });

  const [prices, setPrices] = useState<Record<string, string>>(defaultPrices);

  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "";

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setPrices(p => ({ ...p, ...d.settings })); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ settings: prices }),
      });
      const d = await res.json();
      if (d.success) alert("✅ تم حفظ الأسعار بنجاح");
      else alert(d.message || "خطأ في الحفظ");
    } catch { alert("خطأ في الاتصال"); }
    finally { setSaving(false); }
  };

  const Field = ({ label, k }: { label: string; k: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-bold">€</span>
        <input
          type="number" min="0" step="1"
          value={prices[k] ?? ""}
          onChange={e => setPrices(p => ({ ...p, [k]: e.target.value }))}
          className="w-24 px-3 py-1.5 rounded-lg text-sm font-black text-center focus:outline-none"
          style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
        />
      </div>
    </div>
  );

  const catColors: Record<string, string> = { A: "#f97316", B: "#3b82f6", C: "#22c55e" };
  const catLabels: Record<string, string> = { A: "🏍️ Rijbewijs A", B: "🚗 Rijbewijs B", C: "🚛 Rijbewijs C" };

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">أسعار الاشتراكات</h1>
              <p className="text-white/50 text-xs">تعديل أسعار كل فئة بشكل منفصل</p>
            </div>
          </div>
          <button onClick={onBack} className="px-4 py-2 rounded-lg text-xs font-black text-white hover:scale-105 transition-all" style={{ background: "rgba(255,255,255,0.15)" }}>
            ← رجوع
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* اختيار الفئة */}
        <div className="flex gap-3 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={selectedCat === cat
                ? { background: `linear-gradient(135deg, ${catColors[cat]}, ${catColors[cat]}cc)`, color: "white", boxShadow: `0 4px 14px ${catColors[cat]}40` }
                : { background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb" }
              }>
              {catLabels[cat]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-4">
            {/* Theorie */}
            <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #e5e7eb" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
                </div>
                <h2 className="text-sm font-black text-gray-800">Theorie — Rijbewijs {selectedCat}</h2>
              </div>
              <Field label="2 Weken" k={`theorie_${selectedCat}_2w`} />
              <Field label="1 Maand" k={`theorie_${selectedCat}_1m`} />
            </div>

            {/* Examen */}
            <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #e5e7eb" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" /></svg>
                </div>
                <h2 className="text-sm font-black text-gray-800">Examen — Rijbewijs {selectedCat}</h2>
              </div>
              <Field label="2 Weken" k={`examen_${selectedCat}_2w`} />
              <Field label="1 Maand" k={`examen_${selectedCat}_1m`} />
            </div>

            {/* Praktijk */}
            <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #e5e7eb" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h2 className="text-sm font-black text-gray-800">Praktijk — Rijbewijs {selectedCat}</h2>
              </div>
              <Field label="Oefenvideo's" k={`praktijk_${selectedCat}_training`} />
              <Field label="Gevaarherkenning" k={`praktijk_${selectedCat}_hazard`} />
            </div>

            <button onClick={save} disabled={saving}
              className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
              {saving ? "جاري الحفظ..." : `💾 حفظ أسعار الفئة ${selectedCat}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Component إدارة عناوين الدروس
function LessonsManager({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState("B");
  const [lessons, setLessons] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchLessons = async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons?category=${cat}`);
      const data = await res.json();
      if (data.success) setLessons(data.lessons);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLessons(category); }, [category]);

  const addLesson = async () => {
    if (!newTitle.trim()) return alert("أدخل عنوان الدرس");
    setSaving(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription, category }),
      });
      const data = await res.json();
      if (data.success) { setNewTitle(""); setNewDescription(""); fetchLessons(category); }
      else alert(data.message || "خطأ في الإضافة");
    } catch (e) { alert("خطأ في الاتصال"); }
    finally { setSaving(false); }
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("هل تريد حذف هذا الدرس؟ سيتم حذف جميع أسئلته أيضاً!")) return;
    try {
      const res = await fetch(`/api/lessons?id=${id}&category=${category}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchLessons(category);
      else alert(data.message || "خطأ في الحذف");
    } catch (e) { alert("خطأ في الاتصال"); }
  };

  const updateLesson = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch("/api/lessons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle, description: editDescription, category }),
      });
      const data = await res.json();
      if (data.success) { setEditingId(null); setEditTitle(""); setEditDescription(""); fetchLessons(category); }
      else alert(data.message || "خطأ في التعديل");
    } catch (e) { alert("خطأ في الاتصال"); }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">إدارة عناوين الدروس</h1>
              <p className="text-white/50 text-xs">إضافة وحذف عناوين الدروس</p>
            </div>
          </div>
          <button onClick={onBack} className="px-4 py-2 rounded-lg text-xs font-black text-white transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.15)" }}>
            ← رجوع
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* اختيار الفئة */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-base font-black text-gray-800 mb-4">اختر الفئة</h2>
          <div className="flex gap-3">
            {["A","B","C"].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${category === cat ? "text-white shadow-lg scale-105" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={category === cat ? { background: "linear-gradient(135deg, #003399, #0055cc)" } : {}}>
                Rijbewijs {cat}
              </button>
            ))}
          </div>
        </div>

        {/* إضافة درس جديد */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-base font-black text-gray-800 mb-4">➕ إضافة درس جديد</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="عنوان الدرس بالهولندية..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003399] focus:outline-none text-sm font-medium"
            />
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addLesson()}
              placeholder="عنوان فرعي (اختياري)..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003399] focus:outline-none text-sm font-medium text-gray-500"
            />
            <button onClick={addLesson} disabled={saving}
              className="w-full px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              {saving ? "..." : "إضافة"}
            </button>
          </div>
        </div>

        {/* قائمة الدروس */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-black text-gray-800">دروس الفئة {category} ({lessons.length})</h2>
            {loading && <div className="w-5 h-5 border-2 border-[#003399] border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {lessons.length === 0 && !loading ? (
            <div className="p-10 text-center text-gray-400 font-medium">لا توجد دروس بعد</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                  {editingId === lesson.id ? (
                    // وضع التعديل
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="العنوان..."
                        className="w-full px-3 py-2 border-2 border-[#003399] rounded-lg text-sm font-medium focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && updateLesson(lesson.id)}
                        placeholder="العنوان الفرعي (اختياري)..."
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updateLesson(lesson.id)}
                          className="flex-1 px-4 py-2 rounded-lg text-xs font-black text-white"
                          style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                          ✓ حفظ
                        </button>
                        <button onClick={() => { setEditingId(null); setEditTitle(""); setEditDescription(""); }}
                          className="px-3 py-2 rounded-lg text-xs font-black bg-gray-200 text-gray-600 hover:bg-gray-300">
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    // وضع العرض
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>{i + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{lesson.title}</p>
                          {lesson.description && <p className="text-xs text-gray-400 mt-0.5">{lesson.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(lesson.id); setEditTitle(lesson.title); setEditDescription(lesson.description || ""); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteLesson(lesson.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminQuestionsPage() {
  const { lang, setLang } = useLang();
  const t = adminTranslations[lang as keyof typeof adminTranslations];
  
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [questionType, setQuestionType] = useState<"" | "Theori" | "Praktijk" | "Examen">("");
  const [questionSubType, setQuestionSubType] = useState<"" | "lessons" | "exam">("");

  const [category, setCategory] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lessons, setLessons] = useState<{id: number, name: string}[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editForm, setEditForm] = useState({
    textNL: "", textFR: "", textAR: "",
    explanationNL: "", explanationFR: "", explanationAR: "",
    answer1: "", answer2: "", answer3: "", correctAnswer: 0,
    videoUrls: [] as string[], audioUrl: "",
  });
  const editFormRef = React.useRef(editForm);
  useEffect(() => { editFormRef.current = editForm; }, [editForm]);

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    textNL: "",
    textFR: "",
    textAR: "",
    explanationNL: "",
    explanationFR: "",
    explanationAR: "",
    answer1: "",
    answer2: "",
    answer3: "",
    correctAnswer: 0,
    videoUrls: [] as string[],
    audioUrl: "",
  });

  const lessonsMap: Record<string, any> = {
    A: {
      nl: [
        { id: 4, name: "Motorfiets wetgeving (A) - Introductie" },
        { id: 9, name: "Veiligheidsuitrusting en helm" },
        { id: 10, name: "Balans en manoeuvres op de weg" },
        { id: 11, name: "Correcte positionering in de rijstrook" },
        { id: 12, name: "Verkeersborden specifiek voor motoren" },
        { id: 13, name: "Omgaan met bochten en gladde oppervlakken" },
        { id: 14, name: "Passagiers en lading op de motor" },
        { id: 15, name: "Basis motorfiets mechanica" },
        { id: 16, name: "Zicht en dode hoeken voor motoren" },
        { id: 17, name: "Snelheidsregels voor lichte motoren" },
        { id: 18, name: "Eerste hulp voor motorrijders" },
        { id: 19, name: "Rijden in groepen" },
        { id: 20, name: "Proefexamen categorie A" }
      ],
      fr: [
        { id: 4, name: "Législation moto (A) - Introduction" },
        { id: 9, name: "Équipement de sécurité et casque" },
        { id: 10, name: "Équilibre et manœuvres sur route" },
        { id: 11, name: "Positionnement correct dans la voie" },
        { id: 12, name: "Panneaux de signalisation spécifiques aux motos" },
        { id: 13, name: "Gestion des virages et surfaces glissantes" },
        { id: 14, name: "Passagers et chargement sur la moto" },
        { id: 15, name: "Mécanique de base de la moto" },
        { id: 16, name: "Visibilité et angles morts pour motos" },
        { id: 17, name: "Règles de vitesse pour motos légères" },
        { id: 18, name: "Premiers secours pour motards" },
        { id: 19, name: "Conduite en groupe" },
        { id: 20, name: "Examen blanc catégorie A" }
      ],
      ar: [
        { id: 4, name: "قوانين الدراجات النارية (A) - مقدمة" },
        { id: 9, name: "تجهيزات السلامة والخوذة" },
        { id: 10, name: "التوازن والمناورات على الطريق" },
        { id: 11, name: "التموضع الصحيح في المسار" },
        { id: 12, name: "الإشارات المرورية الخاصة بالموتور" },
        { id: 13, name: "التعامل مع المنعطفات والأسطح الزلقة" },
        { id: 14, name: "الركاب والحمولة على الدراجة" },
        { id: 15, name: "ميكانيك الدراجة النارية الأساسي" },
        { id: 16, name: "الرؤية والنقاط العمياء للموتور" },
        { id: 17, name: "قواعد السرعة للمحركات الخفيفة" },
        { id: 18, name: "الإسعافات الأولية لراكبي الدراجات" },
        { id: 19, name: "القيادة في مجموعات" },
        { id: 20, name: "امتحان تجريبي فئة A" }
      ]
    },
    B: {
      nl: [
        { id: 6, name: "Auto wetgeving (B) - Introductie" },
        { id: 21, name: "Snelheden binnen en buiten de stad" },
        { id: 22, name: "Voorrangsregels en kruispunten" },
        { id: 23, name: "Verticale verkeersborden" },
        { id: 24, name: "Wegmarkeringen en lijnen" },
        { id: 25, name: "Correct parkeren en stoppen" },
        { id: 26, name: "Veilig inhalen en manoeuvres" },
        { id: 27, name: "Lichte auto mechanica" },
        { id: 28, name: "Zicht en rijden in moeilijke omstandigheden" },
        { id: 29, name: "Economisch rijden (Eco-Driving)" },
        { id: 30, name: "Ongevallen en wettelijke aansprakelijkheid" },
        { id: 31, name: "Kwetsbare weggebruikers (voetgangers)" },
        { id: 32, name: "Proefexamen categorie B" }
      ],
      fr: [
        { id: 6, name: "Législation voiture (B) - Introduction" },
        { id: 21, name: "Vitesses en ville et hors agglomération" },
        { id: 22, name: "Règles de priorité et intersections" },
        { id: 23, name: "Panneaux de signalisation verticaux" },
        { id: 24, name: "Marquages au sol et lignes" },
        { id: 25, name: "Stationnement et arrêt corrects" },
        { id: 26, name: "Dépassement sûr et manœuvres" },
        { id: 27, name: "Mécanique automobile légère" },
        { id: 28, name: "Visibilité et conduite en conditions difficiles" },
        { id: 29, name: "Conduite économique (Eco-Driving)" },
        { id: 30, name: "Accidents et responsabilité légale" },
        { id: 31, name: "Usagers vulnérables (piétons)" },
        { id: 32, name: "Examen blanc catégorie B" }
      ],
      ar: [
        { id: 6, name: "قوانين السيارات (B) - مقدمة" },
        { id: 21, name: "السرعات داخل وخارج المدينة" },
        { id: 22, name: "قواعد الأولوية والتقاطعات" },
        { id: 23, name: "الإشارات المرورية العمودية" },
        { id: 24, name: "العلامات الأرضية والخطوط" },
        { id: 25, name: "الوقوف والتوقف الصحيح" },
        { id: 26, name: "التجاوز الآمن والمناورات" },
        { id: 27, name: "ميكانيك السيارة الخفيفة" },
        { id: 28, name: "الرؤية والقيادة في ظروف صعبة" },
        { id: 29, name: "السياقة الاقتصادية (Eco-Driving)" },
        { id: 30, name: "الحوادث والمسؤولية القانونية" },
        { id: 31, name: "مستخدمو الطريق الضعفاء (المشاة)" },
        { id: 32, name: "امتحان تجريبي فئة B" }
      ]
    },
    C: {
      nl: [
        { id: 33, name: "Vrachtwagen wetgeving (C) - Gewichten en afmetingen" },
        { id: 34, name: "Tachograaf en rusttijden" },
        { id: 35, name: "Ladingverdeling en lading beveiligen" },
        { id: 36, name: "Zware voertuig mechanica" },
        { id: 37, name: "Luchtremsystemen (Air Brakes)" },
        { id: 38, name: "Dode hoeken in grote voertuigen" },
        { id: 39, name: "Verkeersregels voor zwaar transport" },
        { id: 40, name: "Verboden wegen en hoogtebeperkingen" },
        { id: 41, name: "Internationale documenten en carnets" },
        { id: 42, name: "Banden vervangen en pech afhandelen" },
        { id: 43, name: "Veilig laden en lossen" },
        { id: 44, name: "Pre-trip inspectie voor vrachtwagens" },
        { id: 45, name: "Proefexamen categorie C" }
      ],
      fr: [
        { id: 33, name: "Législation camion (C) - Poids et dimensions" },
        { id: 34, name: "Tachygraphe et temps de repos" },
        { id: 35, name: "Répartition et sécurisation du chargement" },
        { id: 36, name: "Mécanique des véhicules lourds" },
        { id: 37, name: "Systèmes de freinage pneumatique" },
        { id: 38, name: "Angles morts dans les grands véhicules" },
        { id: 39, name: "Règles de circulation pour transport lourd" },
        { id: 40, name: "Routes interdites et restrictions de hauteur" },
        { id: 41, name: "Documents internationaux et carnets" },
        { id: 42, name: "Changement de pneus et gestion des pannes" },
        { id: 43, name: "Chargement et déchargement sécurisés" },
        { id: 44, name: "Inspection pré-départ pour camions" },
        { id: 45, name: "Examen blanc catégorie C" }
      ],
      ar: [
        { id: 33, name: "قوانين الشاحنات (C) - الأوزان والأبعاد" },
        { id: 34, name: "جهاز التاكوغراف وأوقات الراحة" },
        { id: 35, name: "توزيع الأحمال وتأمين الشحنة" },
        { id: 36, name: "ميكانيك المحركات الثقيلة" },
        { id: 37, name: "أنظمة الفرامل الهوائية (Air Brakes)" },
        { id: 38, name: "الزوايا الميتة في المركبات الكبيرة" },
        { id: 39, name: "قواعد المرور الخاصة بالشحن الثقيل" },
        { id: 40, name: "الطرق المحظورة وقيود الارتفاع" },
        { id: 41, name: "المستندات الدولية ودفاتر المرور" },
        { id: 42, name: "تغيير الإطارات والتعامل مع الأعطال" },
        { id: 43, name: "التحميل والتفريغ الآمن" },
        { id: 44, name: "فحص ما قبل الانطلاق للشاحنة" },
        { id: 45, name: "امتحان تجريبي فئة C" }
      ]
    }
  };

  // خيارات خاصة بـ Praktijk
  const praktijkLessonsMap: Record<string, any> = {
    training: {
      nl: [
        "Introductie tot verkeersveiligheid",
        "Verkeerstekens en wegmarkeringen",
        "Voorrangsregels op kruispunten",
        "Snelheidslimieten en afstanden",
        "Veilig inhalen en invoegen",
        "Rijden in het donker",
        "Rijden bij slecht weer",
        "Parkeren en keren",
        "Rotondes en complexe kruispunken",
        "Defensief rijden",
        "Milieubewust rijden",
        "Eerste hulp bij ongevallen"
      ],
      fr: [
        "Introduction à la sécurité routière",
        "Panneaux et marquages routiers",
        "Règles de priorité aux intersections",
        "Limites de vitesse et distances",
        "Dépassement et insertion en sécurité",
        "Conduite de nuit",
        "Conduite par mauvais temps",
        "Stationnement et demi-tour",
        "Ronds-points et intersections complexes",
        "Conduite défensive",
        "Conduite écologique",
        "Premiers secours en cas d'accident"
      ],
      ar: [
        "مقدمة في السلامة المرورية",
        "إشارات المرور وعلامات الطريق",
        "قواعد الأولوية في التقاطعات",
        "حدود السرعة والمسافات",
        "التجاوز والاندماج الآمن",
        "القيادة في الظلام",
        "القيادة في الطقس السيئ",
        "الوقوف والدوران",
        "الدوارات والتقاطعات المعقدة",
        "القيادة الدفاعية",
        "القيادة الصديقة للبيئة",
        "الإسعافات الأولية عند الحوادث"
      ]
    },
    hazard: {
      nl: [
        "Gevaarherkenning - Stedelijk verkeer",
        "Gevaarherkenning - Snelweg",
        "Gevaarherkenning - Landelijke wegen",
        "Gevaarherkenning - Kruispunten",
        "Gevaarherkenning - Voetgangers",
        "Gevaarherkenning - Fietsers",
        "Gevaarherkenning - Slecht weer",
        "Gevaarherkenning - Nacht rijden",
        "Gevaarherkenning - Kinderen",
        "Gevaarherkenning - Dieren",
        "Gevaarherkenning - Werkzaamheden",
        "Gevaarherkenning - Examen simulatie"
      ],
      fr: [
        "Perception des dangers - Circulation urbaine",
        "Perception des dangers - Autoroute",
        "Perception des dangers - Routes rurales",
        "Perception des dangers - Intersections",
        "Perception des dangers - Piétons",
        "Perception des dangers - Cyclistes",
        "Perception des dangers - Mauvais temps",
        "Perception des dangers - Conduite de nuit",
        "Perception des dangers - Enfants",
        "Perception des dangers - Animaux",
        "Perception des dangers - Travaux routiers",
        "Perception des dangers - Simulation d'examen"
      ],
      ar: [
        "إدراك المخاطر - حركة المرور الحضرية",
        "إدراك المخاطر - الطريق السريع",
        "إدراك المخاطر - الطرق الريفية",
        "إدراك المخاطر - التقاطعات",
        "إدراك المخاطر - المشاة",
        "إدراك المخاطر - راكبو الدراجات",
        "إدراك المخاطر - الطقس السيئ",
        "إدراك المخاطر - القيادة الليلية",
        "إدراك المخاطر - الأطفال",
        "إدراك المخاطر - الحيوانات",
        "إدراك المخاطر - أعمال الطرق",
        "إدراك المخاطر - محاكاة الاختبار"
      ]
    }
  };

  const handleLogin = () => {
    if (user === "sewar" && password === "70709090") {
      setIsLogged(true);
    } else {
      alert(t.incorrectCredentials);
    }
  };

  // إعادة تعيين الفئة عند تغيير نوع السؤال
  useEffect(() => {
    setCategory("");
    setLessons([]);
    setLessonId("");
    setQuestions([]);
  }, [questionType]);

  useEffect(() => {
    if (category) {
      // جلب الدروس من السيرفر لجميع الأنواع
      fetchLessonsFromServer();
      setSelectedLesson("");
      setQuestions([]);
    }
  }, [category, questionType, lang]);

  const fetchLessonsFromServer = async () => {
    try {
      let url = '';
      
      if (questionType === "Praktijk") {
        // جلب دروس Praktijk
        url = `/api/praktijk/lessons?type=${category}`;
      } else {
        // جلب دروس Theori/Examen من LessonA/B/C
        url = `/api/lessons?category=${category}`;
      }
      
      console.log(`🔍 Fetching lessons from: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.lessons) {
        const formattedLessons = data.lessons.map((lesson: any) => ({
          id: lesson.id,
          name: lesson.title
        }));
        setLessons(formattedLessons);
        console.log(`✅ Loaded ${formattedLessons.length} lessons`);
      } else {
        console.error("❌ Failed to fetch lessons:", data.message);
        setLessons([]);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setLessons([]);
    }
  };

  const fetchQuestions = async () => {
    if (!lessonId) return;

    try {
      let url = '';
      
      if (questionType === "Examen") {
        url = `/api/exam-questions?lessonId=${lessonId}&category=${category}`;
      } else if (questionType === "Praktijk") {
        url = `/api/praktijk/questions?lessonId=${lessonId}`;
      } else {
        url = `/api/questions?lessonId=${lessonId}&category=${category}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("خطأ عند جلب الأسئلة:", err);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  const handleAddQuestion = async () => {
    if (questionType === "Examen") {
      if (!lessonId || !newQuestion.textNL) {
        return alert("يجب كتابة السؤال بالهولندية");
      }
      if (!newQuestion.answer1 || !newQuestion.answer2 || !newQuestion.answer3) {
        return alert("يجب إدخال 3 إجابات");
      }
      if (newQuestion.correctAnswer === 0) {
        return alert("يجب اختيار الإجابة الصحيحة");
      }
    } else {
      // للدروس و Praktijk: لا يشترط نص السؤال
      if (!lessonId) {
        return alert("يجب اختيار الدرس");
      }
    }

    try {
      // استخدام API المناسب
      let apiUrl = '';
      if (questionType === "Examen") {
        apiUrl = "/api/exam-questions";
      } else if (questionType === "Praktijk") {
        apiUrl = "/api/praktijk/questions";
      } else {
        apiUrl = "/api/questions";
      }

      const payload: any = {
        lessonId: parseInt(lessonId),
        category: category, // مهم لتجنب تعارض IDs بين الفئات
      };
      
      if (questionType === "Examen") {
        // للامتحانات: حفظ في ExamQuestion
        payload.textNL = newQuestion.textNL;
        payload.answer1 = newQuestion.answer1;
        payload.answer2 = newQuestion.answer2;
        payload.answer3 = newQuestion.answer3;
        payload.correctAnswer = newQuestion.correctAnswer;
        payload.videoUrls = newQuestion.videoUrls;
        payload.audioUrl = newQuestion.audioUrl;
      } else {
        // للدروس و Praktijk: حفظ في Question أو PraktijkQuestion
        payload.text = newQuestion.explanationNL || "";
        payload.textNL = newQuestion.textNL || null;
        payload.explanationNL = newQuestion.explanationNL;
        payload.explanationFR = newQuestion.explanationFR;
        payload.explanationAR = newQuestion.explanationAR;
        payload.videoUrls = newQuestion.videoUrls;
        payload.audioUrl = newQuestion.audioUrl;
      }
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API Error Response:", text);
        console.error("❌ Status Code:", res.status);
        alert(`خطأ من السيرفر: ${text}`);
        return;
      }

      const data = await res.json();
      console.log("📦 Response data:", data);
      
      if (!data.success) {
        console.error("❌ Save failed:", data.message);
        alert(`فشل حفظ السؤال: ${data.message}`);
        return;
      }

      console.log("✅ Question saved successfully!");
      alert("✅ تم حفظ السؤال بنجاح!");
      fetchQuestions();
      setNewQuestion({ 
        text: "",
        textNL: "",
        textFR: "",
        textAR: "",
        explanationNL: "",
        explanationFR: "",
        explanationAR: "",
        answer1: "",
        answer2: "",
        answer3: "",
        correctAnswer: 0,
        videoUrls: [],
        audioUrl: "",
      });
    } catch (err) {
      console.error("خطأ عند حفظ السؤال:", err);
      alert("فشل الاتصال بالسيرفر");
    }
  };
  const handleEditQuestion = async (questionId: number) => {
    const form = editFormRef.current;
    if (!form.textNL && !form.textFR && !form.textAR) {
      alert("أدخل نص السؤال بلغة واحدة على الأقل");
      return;
    }

    try {
      let apiUrl = "/api/questions";
      if (questionType === "Examen") apiUrl = "/api/exam-questions";
      else if (questionType === "Praktijk") apiUrl = "/api/praktijk/questions";

      console.log("📤 Sending videoUrls:", form.videoUrls);

      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: questionId,
          category: category, // مهم لتجنب تعارض IDs
          text: form.textNL || form.textFR || form.textAR || "",
          textNL: form.textNL,
          textFR: form.textFR,
          textAR: form.textAR,
          explanationNL: form.explanationNL,
          explanationFR: form.explanationFR,
          explanationAR: form.explanationAR,
          answer1: form.answer1,
          answer2: form.answer2,
          answer3: form.answer3,
          correctAnswer: form.correctAnswer,
          videoUrls: form.videoUrls,
          audioUrl: form.audioUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ تم تعديل السؤال بنجاح");
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        alert(data.message || "فشل تعديل السؤال");
      }
    } catch (error) {
      console.error("خطأ في التعديل:", error);
      alert("فشل الاتصال بالسيرفر");
    }
  };

  const handleDeleteImage = async (questionId: number, imageUrl: string) => {
    if (!confirm("هل تريد حذف هذه الصورة؟")) return;

    try {
      const res = await fetch("/api/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, imageUrl }),
      });

      const data = await res.json();
      if (data.success) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("خطأ في حذف الصورة:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;

    try {
      // استخدام API المناسب
      let apiUrl = '';
      if (questionType === "Examen") {
        apiUrl = "/api/exam-questions";
      } else if (questionType === "Praktijk") {
        apiUrl = "/api/praktijk/questions";
      } else {
        apiUrl = "/api/questions";
      }
      
      const url = `${apiUrl}?id=${questionId}&category=${category}`;
      
      const res = await fetch(url, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("تم حذف السؤال بنجاح");
        fetchQuestions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      alert("فشل حذف السؤال");
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #001a6e 50%, #0a0a2e 100%)" }}>
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "#ffcc00" }}></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "#003399" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: "#ffffff" }}></div>
        </div>

        <div className="relative z-10 w-full max-w-sm mx-auto px-6">
          {/* لوغو */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", boxShadow: "0 20px 60px rgba(255,204,0,0.4)" }}>
              <svg className="w-10 h-10" style={{ color: "#003399" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{t.adminLogin}</h1>
            <p className="text-white/40 text-sm">{t.manageQuestions}</p>
          </div>

          {/* بطاقة اللوجين */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t.username}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/30 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder={t.password}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/30 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              className="w-full py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
              style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)", color: "#003399", boxShadow: "0 8px 30px rgba(255,204,0,0.35)" }}
              onClick={handleLogin}
            >
              {t.login} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة إدارة عناوين الدروس
  if (questionType === "lessons-manager") {
    return <LessonsManager onBack={() => setQuestionType("")} />;
  }

  // شاشة إدارة الأسعار
  if (questionType === "prices") {
    return <PricesManager onBack={() => setQuestionType("")} />;
  }

  // شاشة اختيار subtype لـ Theori
  if (questionType === "Theori" && !questionSubType) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #001a6e 50%, #0a0a2e 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "#22c55e" }}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "#f97316" }}></div>
        </div>
        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 15px 40px rgba(34,197,94,0.4)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Theorie</h1>
            <p className="text-white/40 text-sm">اختر نوع الأسئلة</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "إضافة شرح الدروس", sub: "تظهر في صفحة الدرس", color: "#22c55e", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13", onClick: () => setQuestionSubType("lessons") },
              { label: "أسئلة الامتحانات", sub: "تظهر في زر Exam", color: "#f97316", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z", onClick: () => { setQuestionSubType("exam"); setQuestionType("Examen"); } },
            ].map(({ label, sub, color, icon, onClick }) => (
              <button key={label} onClick={onClick}
                className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ background: `${color}12`, border: `1.5px solid ${color}40` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at center, ${color}20, transparent)` }}></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 20px ${color}40` }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                  </div>
                  <p className="text-sm font-black text-white mb-0.5">{label}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => setQuestionType("")} className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة اختيار نوع الأسئلة
  if (!questionType) {
    const menuItems = [
      {
        type: "Theori", label: t.theori, sub: t.theoryQuestions,
        color: "#22c55e", glow: "rgba(34,197,94,0.25)",
        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        badge: "نظري"
      },
      {
        type: "Praktijk", label: t.praktijk, sub: t.practicalQuestions,
        color: "#3b82f6", glow: "rgba(59,130,246,0.25)",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        badge: "عملي"
      },
      {
        type: "Examen", label: t.examen, sub: t.examQuestions,
        color: "#f97316", glow: "rgba(249,115,22,0.25)",
        icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
        badge: "امتحان"
      },
      {
        type: "lessons-manager", label: "عناوين الدروس", sub: "إضافة وحذف عناوين الدروس",
        color: "#14b8a6", glow: "rgba(20,184,166,0.25)",
        icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
        badge: "إدارة"
      },
      {
        type: "subscribers", label: "المشتركون", sub: "عرض قائمة المشتركين",
        color: "#a855f7", glow: "rgba(168,85,247,0.25)",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
        badge: "مستخدمون"
      },
      {
        type: "prices", label: "الأسعار", sub: "تعديل أسعار الاشتراكات",
        color: "#f59e0b", glow: "rgba(245,158,11,0.25)",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        badge: "إعدادات"
      },
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, #060818 0%, #0d1b4b 45%, #060818 100%)" }}>
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[100px]" style={{ background: "#ffcc00" }}></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[100px]" style={{ background: "#3b82f6" }}></div>
          {/* شبكة نقاط */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold" style={{ background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", color: "#ffcc00" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              لوحة التحكم
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{t.chooseQuestionType}</h1>
            <p className="text-white/35 text-sm">{t.selectType}</p>
          </div>

          {/* الكروت */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(({ type, label, sub, color, glow, icon, badge }) => (
              <button
                key={type}
                onClick={() => {
                  if (type === "subscribers") window.open("/admin/subscribers", "_blank");
                  else if (type === "lessons-manager") setQuestionType("lessons-manager" as any);
                  else if (type === "prices") setQuestionType("prices" as any);
                  else setQuestionType(type as any);
                }}
                className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* توهج عند hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `radial-gradient(ellipse at top left, ${glow}, transparent 70%)` }}></div>
                {/* خط علوي ملون */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}></div>

                <div className="relative z-10 p-6">
                  {/* أيقونة + badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, border: `1px solid ${color}40` }}>
                      <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                      </svg>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                      {badge}
                    </span>
                  </div>

                  {/* النص */}
                  <h3 className="text-base font-black text-white mb-1.5 group-hover:text-white transition-colors">{label}</h3>
                  <p className="text-xs text-white/35 leading-relaxed">{sub}</p>

                  {/* سهم */}
                  <div className="mt-5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
                    <span className="text-xs font-bold" style={{ color }}>فتح</span>
                    <svg className="w-3.5 h-3.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button onClick={() => setIsLogged(false)} className="inline-flex items-center gap-2 text-white/25 hover:text-white/50 text-xs transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t.backToLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Header خرافي */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a2e 0%, #003399 60%, #0055cc 100%)" }}>
        {/* خطوط زخرفية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "#ffcc00", transform: "translate(-50%, -50%)" }}></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "#ff9900", transform: "translate(30%, 30%)" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* اليسار: اللوغو + العنوان */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #ffcc00, #ff9900)" }}>
                <svg className="w-7 h-7 text-[#003399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-wide">إدارة وتنظيم الأسئلة</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,204,0,0.2)", color: "#ffcc00", border: "1px solid rgba(255,204,0,0.4)" }}>
                    {questionType}
                  </span>
                  <span className="text-white/40 text-xs">{t.systemManagement}</span>
                </div>
              </div>
            </div>

            {/* اليمين: أزرار */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* أزرار اللغة */}
              <div className="flex gap-0.5 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                {[["nl","NL"],["fr","FR"],["ar","AR"]].map(([code, label]) => (
                  <button key={code} onClick={() => setLang(code as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-black transition-all ${lang === code ? "bg-white text-[#003399] shadow-md" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* زر تغيير النوع */}
              <button onClick={() => { setQuestionType(""); setQuestionSubType(""); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {t.changeType}
              </button>

              {/* زر الخروج */}
              <button onClick={() => setIsLogged(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(239,68,68,0.7)", color: "white", border: "1px solid rgba(239,68,68,0.4)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* قسم الفلتر */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </div>
            <h2 className="text-sm font-black text-gray-700">{t.filterQuestions}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {questionType === "Praktijk" ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">نوع المحتوى</label>
                <select className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 focus:outline-none" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">اختر نوع المحتوى</option>
                  <option value="training">فيديوهات تدريبية</option>
                  <option value="hazard">إدراك المخاطر</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">الفئة</label>
                <select className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 focus:outline-none" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">اختر الفئة</option>
                  <option value="A">🏍️ فئة الموتورات (A)</option>
                  <option value="B">🚗 فئة السيارات (B)</option>
                  <option value="C">🚛 فئة الشاحنات (C)</option>
                </select>
              </div>
            )}
            {lessons.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">الدرس</label>
                <select className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 focus:outline-none" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
                  <option value="">اختر الدرس</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        {lessonId && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h2 className="text-sm font-black text-gray-700">{questionType === "Examen" ? "إضافة سؤال جديد" : "إضافة شرح جديد"}</h2>
            </div>
            <div className="space-y-4">
              {/* نص السؤال - للامتحانات فقط */}
              {questionType === "Examen" && (
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">🇳🇱 نص السؤال (Nederlands)</label>
                  <textarea
                    placeholder="Vraag in het Nederlands..."
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none resize-none transition-all"
                    style={{ background: "#f0f4ff", border: "1.5px solid #c7d2fe" }}
                    rows={3}
                    value={newQuestion.textNL}
                    onChange={(e) => setNewQuestion({ ...newQuestion, textNL: e.target.value })}
                  />
                </div>
              )}

              {/* الشرح - هولندي فقط - للدروس فقط */}
              {questionType !== "Examen" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">📌 عنوان النقطة</label>
                    <input
                      type="text"
                      placeholder="مثال: Maximumsnelheid op autosnelweg..."
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none transition-all"
                      style={{ background: "#f0f4ff", border: "1.5px solid #c7d2fe" }}
                      value={newQuestion.textNL || ""}
                      onChange={(e) => setNewQuestion({ ...newQuestion, textNL: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">🇳🇱 الشرح (Nederlands)</label>
                    <textarea
                      placeholder="Uitleg in het Nederlands..."
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none transition-all"
                      style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", resize: "vertical", minHeight: "96px" }}
                      value={newQuestion.explanationNL}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanationNL: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* حقول الإجابات (للامتحانات فقط) */}
              {questionType === "Examen" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    خيارات الإجابة (3 خيارات)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الأولى
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الأولى..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer1}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الثانية
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الثانية..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer2}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer2: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الثالثة
                      </label>
                      <input
                        type="text"
                        placeholder="الإجابة الثالثة..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.answer3}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer3: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الإجابة الصحيحة
                      </label>
                      <select
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                      >
                        <option value={0}>اختر الإجابة الصحيحة</option>
                        <option value={1}>الإجابة الأولى</option>
                        <option value={2}>الإجابة الثانية</option>
                        <option value={3}>الإجابة الثالثة</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* رفع الملفات - حسب نوع السؤال */}
              {questionType === "Praktijk" ? (
                // Praktijk: فيديو + صوت
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📹 رفع فيديو
                    </label>
                    <FileUploader
                      type="video"
                      onUploadComplete={(url, publicId) => {
                        setNewQuestion({
                          ...newQuestion,
                          videoUrls: [...newQuestion.videoUrls, url],
                        });
                      }}
                      maxSizeMB={100}
                    />
                    {newQuestion.videoUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium mb-2">
                          ✅ تم رفع {newQuestion.videoUrls.length} فيديو
                        </p>
                        <div className="space-y-2">
                          {newQuestion.videoUrls.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                              <video src={url} className="w-20 h-14 object-cover rounded" />
                              <span className="text-xs text-gray-600 flex-1">فيديو {idx + 1}</span>
                              <button
                                onClick={() => {
                                  setNewQuestion({
                                    ...newQuestion,
                                    videoUrls: newQuestion.videoUrls.filter((_, i) => i !== idx),
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎵 رفع ملف صوتي
                    </label>
                    <FileUploader
                      type="audio"
                      onUploadComplete={(url, publicId) => {
                        setNewQuestion({
                          ...newQuestion,
                          audioUrl: url,
                        });
                      }}
                      maxSizeMB={10}
                    />
                    {newQuestion.audioUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium mb-2">✅ تم رفع الملف الصوتي</p>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <audio src={newQuestion.audioUrl} controls className="w-full" />
                          <button
                            onClick={() => {
                              setNewQuestion({
                                ...newQuestion,
                                audioUrl: "",
                              });
                            }}
                            className="mt-2 text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            حذف الملف الصوتي
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Theorie & Examen: صور + صوت
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🖼️ رفع صورة
                    </label>
                    <FileUploader
                      type="image"
                      onUploadComplete={(url, publicId) => {
                        setNewQuestion({
                          ...newQuestion,
                          videoUrls: [...newQuestion.videoUrls, url],
                        });
                      }}
                      maxSizeMB={5}
                    />
                    {newQuestion.videoUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium mb-2">
                          ✅ تم رفع {newQuestion.videoUrls.length} صورة
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {newQuestion.videoUrls.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              <button
                                onClick={() => {
                                  setNewQuestion({
                                    ...newQuestion,
                                    videoUrls: newQuestion.videoUrls.filter((_, i) => i !== idx),
                                  });
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎵 رفع ملف صوتي
                    </label>
                    <FileUploader
                      type="audio"
                      onUploadComplete={(url, publicId) => {
                        setNewQuestion({
                          ...newQuestion,
                          audioUrl: url,
                        });
                      }}
                      maxSizeMB={10}
                    />
                    {newQuestion.audioUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium mb-2">✅ تم رفع الملف الصوتي</p>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <audio src={newQuestion.audioUrl} controls className="w-full" />
                          <button
                            onClick={() => {
                              setNewQuestion({
                                ...newQuestion,
                                audioUrl: "",
                              });
                            }}
                            className="mt-2 text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            حذف الملف الصوتي
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                className="w-full py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.01] active:scale-95"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
                onClick={handleAddQuestion}
              >
                💾 حفظ السؤال
              </button>
            </div>
          </div>
        )}

        {lessonId && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            {/* شريط البحث */}
            <div className="p-5 border-b border-gray-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن سؤال..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* عنوان القائمة */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">الأسئلة</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black" style={{ background: "linear-gradient(135deg, #003399, #0055cc)", color: "white" }}>
                {filteredQuestions.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100 p-4 space-y-0">
              {filteredQuestions.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm text-gray-400 font-medium">
                    {questionType === "Examen" ? "لا توجد أسئلة لهذا الدرس بعد" : "لا يوجد شرح لهذا الدرس بعد"}
                  </p>
                </div>
              ) : filteredQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="rounded-2xl overflow-hidden transition-all mb-4"
                  style={{ border: editingQuestion?.id === q.id ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb", background: editingQuestion?.id === q.id ? "#eff6ff" : "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  {editingQuestion?.id === q.id ? (
                    <div className="space-y-4 p-5">
                      {/* نص السؤال - هولندي فقط */}
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">🇳🇱 نص السؤال (Nederlands)</label>
                        <textarea value={editForm.textNL} onChange={(e) => setEditForm({ ...editForm, textNL: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none resize-none"
                          style={{ background: "#f0f4ff", border: "1.5px solid #c7d2fe" }} rows={3} />
                      </div>

                      {/* الشرح - هولندي فقط - للدروس فقط */}
                      {questionType !== "Examen" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">📌 عنوان النقطة</label>
                            <input type="text" value={editForm.textNL}
                              onChange={(e) => setEditForm({ ...editForm, textNL: e.target.value })}
                              placeholder="عنوان النقطة..."
                              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
                              style={{ background: "#f0f4ff", border: "1.5px solid #c7d2fe" }} />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">🇳🇱 الشرح (Nederlands)</label>
                            <textarea value={editForm.explanationNL} onChange={(e) => setEditForm({ ...editForm, explanationNL: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
                              style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", resize: "vertical", minHeight: "96px" }} />
                          </div>
                        </div>
                      )}

                      {/* الإجابات - للامتحانات */}
                      {questionType === "Examen" && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <h3 className="text-sm font-bold text-gray-800 mb-3">✅ تعديل الإجابات</h3>
                          <div className="space-y-3">
                            {[1, 2, 3].map((num) => (
                              <div key={num}>
                                <label className="block text-xs font-bold text-gray-600 mb-1">الإجابة {num}</label>
                                <input type="text" value={editForm[`answer${num}` as "answer1" | "answer2" | "answer3"]} onChange={(e) => setEditForm({ ...editForm, [`answer${num}`]: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm" />
                              </div>
                            ))}
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">الإجابة الصحيحة</label>
                              <select value={editForm.correctAnswer} onChange={(e) => setEditForm({ ...editForm, correctAnswer: parseInt(e.target.value) })} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm">
                                <option value={0}>اختر الإجابة الصحيحة</option>
                                <option value={1}>الإجابة الأولى</option>
                                <option value={2}>الإجابة الثانية</option>
                                <option value={3}>الإجابة الثالثة</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* إدارة الصور / الفيديوهات */}
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">
                          {questionType === "Praktijk" ? "🎬 إدارة الفيديوهات" : "🖼️ إدارة الصور"}
                        </h3>

                        {/* الصور/الفيديوهات الحالية */}
                        {editForm.videoUrls.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-bold text-gray-600 mb-2">
                              {questionType === "Praktijk" ? "الفيديوهات الحالية:" : "الصور الحالية:"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {editForm.videoUrls.map((url, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-gray-200">
                                  {questionType === "Praktijk" ? (
                                    <video src={url} className="w-full h-28 object-cover" />
                                  ) : (
                                    <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-28 object-cover" />
                                  )}
                                  {/* زر الحذف */}
                                  <button
                                    onClick={() => setEditForm(prev => ({ ...prev, videoUrls: prev.videoUrls.filter((_, i) => i !== idx) }))}
                                    className="absolute top-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="حذف"
                                  >
                                    ×
                                  </button>
                                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                    {idx + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* رفع صورة/فيديو جديد */}
                        <div>
                          <p className="text-xs font-bold text-gray-600 mb-2">
                            ➕ {questionType === "Praktijk" ? "إضافة فيديو جديد" : "إضافة صورة جديدة"}
                          </p>
                          <FileUploader
                            type={questionType === "Praktijk" ? "video" : "image"}
                            onUploadComplete={(url) => setEditForm(prev => ({ ...prev, videoUrls: [...prev.videoUrls, url] }))}
                            maxSizeMB={questionType === "Praktijk" ? 100 : 5}
                          />
                        </div>
                      </div>

                      {/* إدارة الصوت */}
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">🎵 إدارة الملف الصوتي</h3>
                        {editForm.audioUrl ? (
                          <div className="space-y-2">
                            <audio src={editForm.audioUrl} controls className="w-full" />
                            <button
                              onClick={() => setEditForm(prev => ({ ...prev, audioUrl: "" }))}
                              className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-bold transition"
                            >
                              🗑️ حذف الملف الصوتي
                            </button>
                          </div>
                        ) : (
                          <FileUploader
                            type="audio"
                            onUploadComplete={(url) => setEditForm(prev => ({ ...prev, audioUrl: url }))}
                            maxSizeMB={10}
                          />
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => handleEditQuestion(q.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-95" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          حفظ التعديلات
                        </button>
                        <button onClick={() => setEditingQuestion(null)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-95" style={{ background: "#f1f5f9", color: "#64748b", border: "1.5px solid #e2e8f0" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      {/* رقم السؤال */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                          {index + 1}
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">سؤال #{q.id}</span>
                      </div>

                      {/* 1. الصورة أولاً */}
                      {q.videoUrls && q.videoUrls.length > 0 && (
                        <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                          <div className={`grid gap-0.5 ${q.videoUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                            {q.videoUrls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                {questionType === "Praktijk" ? (
                                  <video src={url} controls className="w-full object-cover" style={{ maxHeight: "280px" }} />
                                ) : (
                                  <img src={url} alt={`صورة ${idx + 1}`} className="w-full object-cover" style={{ maxHeight: "280px" }} />
                                )}
                                <button
                                  onClick={() => handleDeleteImage(q.id, url)}
                                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all font-bold text-sm shadow-lg flex items-center justify-center"
                                >×</button>
                                {q.videoUrls!.length > 1 && (
                                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                    {idx + 1}/{q.videoUrls!.length}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* صوت */}
                      {q.audioUrl && (
                        <div className="mb-4 px-3 py-2 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <p className="text-xs font-bold text-gray-400 mb-1.5">🎵 ملف صوتي</p>
                          <audio controls className="w-full h-8">
                            <source src={q.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}

                      {/* 2. نص السؤال - هولندي فقط */}
                      <div className="mb-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">عنوان النقطة</p>
                        <div className="px-4 py-3 rounded-xl" style={{ background: "#f0f4ff", border: "1px solid #c7d2fe" }}>
                          <p className="text-sm font-bold text-gray-800 leading-snug">
                            {q.textNL || q.text || "—"}
                          </p>
                        </div>
                      </div>

                      {/* 3. الشرح - هولندي فقط */}
                      {(q.explanationNL || q.explanationFR || q.explanationAR) && (
                        <div className="mb-4">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">الشرح</p>
                          <div className="px-4 py-3 rounded-xl" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">🇳🇱 Nederlands</span>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                              {q.explanationNL || "—"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* عرض الإجابات للامتحانات */}
                      {(q.answer1 || q.answer2 || q.answer3) && (
                        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            خيارات الإجابة:
                          </p>
                          <div className="space-y-2">
                            {q.answer1 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 1 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 1 ? '✓ ' : ''}الإجابة 1:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer1}</p>
                              </div>
                            )}
                            {q.answer2 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 2 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 2 ? '✓ ' : ''}الإجابة 2:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer2}</p>
                              </div>
                            )}
                            {q.answer3 && (
                              <div className={`bg-white p-3 rounded-lg border ${q.correctAnswer === 3 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <p className="text-xs font-bold text-gray-600 mb-1">
                                  {q.correctAnswer === 3 ? '✓ ' : ''}الإجابة 3:
                                </p>
                                <p className="text-sm text-gray-700">{q.answer3}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setEditText(q.text);
                            setEditForm({
                              textNL: q.textNL || "",
                              textFR: q.textFR || "",
                              textAR: q.textAR || "",
                              explanationNL: q.explanationNL || "",
                              explanationFR: q.explanationFR || "",
                              explanationAR: q.explanationAR || "",
                              answer1: q.answer1 || "",
                              answer2: q.answer2 || "",
                              answer3: q.answer3 || "",
                              correctAnswer: q.correctAnswer || 0,
                              videoUrls: q.videoUrls || [],
                              audioUrl: q.audioUrl || "",
                            });
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          حذف
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="صورة مكبرة"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}