"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";

function ExamenCategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const cat = searchParams.get("cat") || "B";
  const email = searchParams.get("email") || "";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // جلب كل الدروس للفئة
        const lessonsRes = await fetch(`/api/lessons?category=${cat.toUpperCase()}`);
        const lessonsData = await lessonsRes.json();
        if (!lessonsData.success) { setLoading(false); return; }

        // جلب أسئلة الامتحان لكل درس
        const allQuestions: any[] = [];
        for (const lesson of lessonsData.lessons) {
          const qRes = await fetch(`/api/exam-questions?lessonId=${lesson.id}`);
          const qData = await qRes.json();
          if (qData.success && qData.questions?.length > 0) {
            allQuestions.push(...qData.questions.map((q: any) => ({ ...q, lessonTitle: lesson.title })));
          }
        }
        setQuestions(allQuestions);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [cat]);

  const paginated = questions.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(questions.length / PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div className="w-full px-4 py-6 max-w-4xl mx-auto">

        <button onClick={() => router.back()} className="mb-4 text-[#003399] font-bold hover:underline text-sm">
          ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : "Back"}
        </button>

        <h1 className="text-xl font-black text-[#003399] uppercase border-b-4 border-[#003399] pb-3 mb-6">
          {lang === "ar" ? `امتحان الفئة ${cat}` : lang === "nl" ? `Examen Categorie ${cat}` : lang === "fr" ? `Examen Catégorie ${cat}` : `Exam Category ${cat}`}
          <span className="text-sm font-normal text-gray-500 ml-3">({questions.length} {lang === "ar" ? "سؤال" : lang === "nl" ? "vragen" : "questions"})</span>
        </h1>

        {questions.length === 0 ? (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center rounded">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "لا توجد أسئلة امتحان لهذه الفئة بعد" : lang === "nl" ? "Nog geen examenvragen voor deze categorie" : "No exam questions yet for this category"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={page * PER_PAGE + i}
                  total={questions.length}
                  lang={lang}
                  onNext={() => {}}
                  onPrev={() => {}}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo(0, 0); }}
                  disabled={page === 0}
                  className={`px-6 py-3 font-black text-sm border-2 transition-all ${page === 0 ? "text-gray-300 border-gray-200 cursor-not-allowed" : "text-[#003399] border-[#003399] hover:bg-[#003399] hover:text-white"}`}
                >
                  ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : "Previous"}
                </button>
                <span className="text-sm text-gray-500 font-bold">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo(0, 0); }}
                  disabled={page === totalPages - 1}
                  className={`px-6 py-3 font-black text-sm border-2 transition-all text-white ${page === totalPages - 1 ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed" : "border-[#003399]"}`}
                  style={page < totalPages - 1 ? { background: "linear-gradient(135deg, #003399, #0055cc)" } : {}}
                >
                  {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : "Next"} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ExamenCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ExamenCategoryContent />
    </Suspense>
  );
}
