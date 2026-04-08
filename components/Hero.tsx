"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { useLang } from "@/context/LangContext";

interface HeroProps {
  onSelect: () => void;
}

export default function Hero({ onSelect }: HeroProps) {
  const { lang } = useLang();
  const router = useRouter();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  return (
    <section
      className="flex justify-center items-center min-h-[80vh] px-4 py-8"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)" }}
    >
      <div className="relative w-full max-w-4xl">

        {/* توهج ذهبي خلفي */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4af37, transparent)" }}
        ></div>

        <div className="relative rounded-2xl overflow-hidden flex flex-col border"
          style={{ borderColor: "#d4af37", boxShadow: "0 0 60px rgba(212,175,55,0.3), 0 25px 50px rgba(0,0,0,0.8)" }}
        >
          {/* صورة الخلفية */}
          <div className="relative h-56 md:h-72 group overflow-hidden">
            <Image
              src="/hero.jpg"
              alt="Driving lesson"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,10,10,0.7))" }}
            ></div>

            {/* شارة */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ background: "rgba(0,0,0,0.8)", borderColor: "#d4af37" }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#d4af37" }}></div>
              <span className="text-xs font-bold" style={{ color: "#d4af37" }}>
                {lang === "ar" ? "متاح الآن" : lang === "nl" ? "Nu beschikbaar" : lang === "fr" ? "Disponible" : "Available now"}
              </span>
            </div>

            {/* اللوغو فوق الصورة في المنتصف */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
              <div className="rounded-full p-2 border-4"
                style={{ background: "#0f0f0f", borderColor: "#d4af37", boxShadow: "0 0 30px rgba(212,175,55,0.6)" }}
              >
                <Image
                  src="/logo.jpg"
                  alt="S & A Rijacademie"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                  style={{ width: '120px', height: '120px' }}
                />
              </div>
            </div>
          </div>

          {/* قسم المحتوى */}
          <div className="flex flex-col items-center text-center pt-20 pb-8 px-6 md:px-12 relative"
            style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)" }}
          >
            {/* خطوط ذهبية */}
            <div className="absolute top-0 left-0 w-full h-0.5"
              style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)" }}
            ></div>

            <p className="text-sm md:text-base leading-relaxed mb-6 max-w-xl" style={{ color: "#a0a0a0" }}>
              {t.heroText}
            </p>

            <button
              onClick={() => router.push("/info")}
              className="group flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 mb-8"
              style={{
                background: "linear-gradient(135deg, #d4af37, #f0d060, #d4af37)",
                color: "#0a0a0a",
                boxShadow: "0 4px 20px rgba(212,175,55,0.4)"
              }}
            >
              <span>{t.heroButton}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>

            {/* إحصائيات */}
            <div className="w-full grid grid-cols-3 gap-3 pt-6 border-t"
              style={{ borderColor: "rgba(212,175,55,0.2)" }}
            >
              {[
                { value: "500+", label: lang === "ar" ? "طالب" : lang === "nl" ? "Studenten" : lang === "fr" ? "Étudiants" : "Students" },
                { value: "98%", label: lang === "ar" ? "نجاح" : lang === "nl" ? "Geslaagd" : lang === "fr" ? "Réussite" : "Pass rate" },
                { value: "A·B·C", label: lang === "ar" ? "فئات" : lang === "nl" ? "Categorieën" : lang === "fr" ? "Catégories" : "Categories" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1" style={{ color: "#d4af37" }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: "#666" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
