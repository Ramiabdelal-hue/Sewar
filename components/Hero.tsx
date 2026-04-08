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
      <div className="relative w-full max-w-5xl">

        {/* توهج ذهبي خلفي */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #d4af37, transparent)" }}
        ></div>

        <div className="relative rounded-2xl overflow-hidden flex flex-col md:flex-row border"
          style={{ borderColor: "#d4af37", boxShadow: "0 0 60px rgba(212,175,55,0.3), 0 25px 50px rgba(0,0,0,0.8)" }}
        >
          {/* قسم الصورة */}
          <div className="relative md:w-1/2 h-64 md:h-auto min-h-[300px] group overflow-hidden">
            <Image
              src="/hero.jpg"
              alt="Driving lesson"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* طبقة داكنة ذهبية فوق الصورة */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(10,10,10,0.5))" }}
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
          </div>

          {/* قسم المحتوى */}
          <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)" }}
          >
            {/* خطوط ذهبية زخرفية */}
            <div className="absolute top-0 left-0 w-full h-1"
              style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)" }}
            ></div>
            <div className="absolute bottom-0 left-0 w-full h-1"
              style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)" }}
            ></div>
            <div className="absolute top-0 right-0 w-1 h-full"
              style={{ background: "linear-gradient(to bottom, transparent, #d4af37, transparent)" }}
            ></div>

            {/* أيقونة */}
            <div className="mb-5 inline-block">
              <div className="p-3 rounded-xl w-fit border"
                style={{ background: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)" }}
              >
                <svg className="w-10 h-10" fill="none" stroke="#d4af37" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <Image src="/logo.png" alt="S & A Rijacademie" width={200} height={100} className="object-contain" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.8)) brightness(1.2)', maxHeight: '100px', width: 'auto' }} />
            </div>

            <p className="mb-8 text-sm md:text-base leading-relaxed" style={{ color: "#a0a0a0" }}>
              {t.heroText}
            </p>

            <button
              onClick={() => router.push("/info")}
              className="group w-fit flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
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
            <div className="mt-8 pt-6 grid grid-cols-3 gap-3 border-t"
              style={{ borderColor: "rgba(212,175,55,0.2)" }}
            >
              {[
                { value: "500+", label: lang === "ar" ? "طالب" : lang === "nl" ? "Studenten" : lang === "fr" ? "Étudiants" : "Students" },
                { value: "98%", label: lang === "ar" ? "نجاح" : lang === "nl" ? "Geslaagd" : lang === "fr" ? "Réussite" : "Pass rate" },
                { value: "A·B·C", label: lang === "ar" ? "فئات" : lang === "nl" ? "Categorieën" : lang === "fr" ? "Catégories" : "Categories" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1" style={{ color: "#d4af37" }}>
                    {stat.value}
                  </div>
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
