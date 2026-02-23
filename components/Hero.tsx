"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import { useLang } from "@/context/LangContext";

interface HeroProps {
  onSelect: () => void;
}

export default function Hero({ onSelect }: HeroProps) {
  const { lang } = useLang();
  const router = useRouter();

  const translations: any = { nl, fr, ar };
  const t = translations[lang];

  return (
    <section className="flex justify-center items-center min-h-[75vh] px-4 md:px-8 lg:px-12 py-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-5xl">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          {/* Image Section */}
          <div className="relative md:w-1/2 h-64 md:h-auto group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
            <Image
              src="/hero.jpg"
              alt="Driving lesson"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Overlay badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-800">
                {lang === "ar" ? "متاح الآن" : lang === "nl" ? "Nu beschikbaar" : "Disponible maintenant"}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white flex flex-col justify-center p-6 md:p-10 lg:p-12 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-4 inline-block">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight drop-shadow-lg">
                {t.heroTitle}
              </h1>

              <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed text-white/95">
                {t.heroText}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/info")}
                  className="group bg-white text-red-600 px-6 py-3 rounded-full font-bold text-base hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{t.heroButton}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1">500+</div>
                  <div className="text-xs text-white/80">
                    {lang === "ar" ? "طالب" : lang === "nl" ? "Studenten" : "Étudiants"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1">100%</div>
                  <div className="text-xs text-white/80">
                    {lang === "ar" ? "نجاح" : lang === "nl" ? "Slaagpercentage" : "Taux de réussite"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1">A, B, C</div>
                  <div className="text-xs text-white/80">
                    {lang === "ar" ? "فئات" : lang === "nl" ? "Categorieën" : "Catégories"}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
