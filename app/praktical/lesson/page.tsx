"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import Navbar from "@/components/Navbar";

function PrakticalLessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  const lessonId = searchParams.get("lessonId");
  const title = searchParams.get("title");
  const email = searchParams.get("email");

  const [lesson, setLesson] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    console.log("🔍 lessonId from URL:", lessonId);
    if (!lessonId) { router.push("/"); return; }

    const fetchLesson = async () => {
      try {
        const url = `/api/praktijk/questions?lessonId=${lessonId}`;
        console.log("📡 Fetching:", url);
        const res = await fetch(url);
        const data = await res.json();
        console.log("📦 Response:", JSON.stringify(data).substring(0, 200));
        if (data.success) {
          setLesson(data.lesson);
          const qs = data.questions || data.lesson?.questions || [];
          setQuestions(qs);
          console.log(`✅ Questions loaded: ${qs.length}`);
        }
      } catch (e) { console.error("❌ Error:", e); }
      finally { setLoading(false); }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div className="w-full px-4 py-6 max-w-4xl mx-auto">

        {/* زر الرجوع */}
        <button onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-[#003399] font-bold hover:underline">
          ← {lang === "ar" ? "رجوع" : lang === "nl" ? "Terug" : lang === "fr" ? "Retour" : "Back"}
        </button>

        <h1 className="text-xl font-black text-[#003399] border-b-4 border-[#003399] pb-3 mb-6 uppercase">
          {title || lesson?.title}
        </h1>

        {/* فيديو الدرس */}
        {lesson?.videoUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border-2 border-[#3399ff]">
            <video controls className="w-full" src={lesson.videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* الأسئلة */}
        {questions.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-[#003399] mb-4 uppercase border-b-2 border-[#ddeeff] pb-2">
              {lang === "ar" ? "الأسئلة" : lang === "nl" ? "Vragen" : lang === "fr" ? "Questions" : "Questions"} ({questions.length})
            </h2>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* السؤال الحالي */}
              {currentQ && (
                <div className="p-6">
                  {/* فيديوهات السؤال */}
                  {currentQ.videoUrls && Array.isArray(currentQ.videoUrls) && currentQ.videoUrls.length > 0 && (
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQ.videoUrls.map((url: string, i: number) => (
                        url && <video key={i} controls className="w-full rounded-lg border border-gray-200">
                          <source src={url} />
                        </video>
                      ))}
                    </div>
                  )}

                  <p className="text-base font-bold text-gray-800 mb-4">
                    {currentIndex + 1}. {currentQ.textNL || currentQ.text}
                  </p>

                  <p className="text-xs text-gray-400 mt-4">
                    {currentIndex + 1} / {questions.length}
                  </p>
                </div>
              )}

              {/* أزرار التنقل */}
              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className={`flex-1 py-3 font-bold text-sm border-r border-gray-200 transition-colors ${currentIndex === 0 ? "text-gray-300" : "text-[#003399] hover:bg-[#ddeeff]"}`}
                >
                  ← {lang === "ar" ? "السابق" : lang === "nl" ? "Vorige" : "Previous"}
                </button>
                <button
                  onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className={`flex-1 py-3 font-bold text-sm transition-colors ${currentIndex === questions.length - 1 ? "text-gray-300" : "text-[#003399] hover:bg-[#ddeeff]"}`}
                >
                  {lang === "ar" ? "التالي" : lang === "nl" ? "Volgende" : "Next"} →
                </button>
              </div>
            </div>
          </div>
        )}

        {!lesson?.videoUrl && questions.length === 0 && (
          <div className="border border-yellow-300 bg-yellow-50 p-6 text-center rounded">
            <p className="font-bold text-gray-700">
              {lang === "ar" ? "لا يوجد محتوى لهذا الدرس بعد" : lang === "nl" ? "Nog geen inhoud voor deze les" : "No content yet for this lesson"}
            </p>
            <p className="text-xs text-gray-400 mt-2">lessonId: {lessonId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrakticalLessonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <PrakticalLessonContent />
    </Suspense>
  );
}
