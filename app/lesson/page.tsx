"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import Navbar from "@/components/Navbar";

interface Lesson {
  id: number;
  title: string;
  category: string;
  description: string | null;
  videoUrl: string | null;
}

function LessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  
  const translations = { nl, fr, ar };
  const t = translations[lang];
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const lessonId = searchParams.get("id");
  const category = searchParams.get("category");

  useEffect(() => {
    if (!lessonId || !category) {
      router.push("/");
      return;
    }

    // Fetch lesson details
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lessons?id=${lessonId}&category=${category}`);
        const data = await response.json();
        
        if (data.success && data.lesson) {
          setLesson(data.lesson);
        } else {
          console.error("Failed to fetch lesson");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, category, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Lesson not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Lesson card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Lesson header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-blue-100">
                Category: {lesson.category}
              </p>
            </div>

            {/* Lesson content */}
            <div className="p-6">
              {lesson.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
                </div>
              )}

              {lesson.videoUrl && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">
                    Video
                  </h2>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={lesson.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => router.push(`/lessons?category=${category}`)}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  View All Lessons
                </button>
                <button
                  onClick={() => router.push(`/examen?category=${category}`)}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {t.examen || "Take Exam"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}
