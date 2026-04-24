"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export default function ContactPage() {
  const { lang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];
  const isRtl = lang === "ar";

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) { setError(t.errorMessage); return; }
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      } else { setError(data.message || t.errorMessage); }
    } catch { setError(t.errorMessage); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border-2 border-gray-200 focus:border-[#003399] focus:outline-none transition-all placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero Banner */}
      <div className="w-full py-10 px-4 text-center" style={{ background: "linear-gradient(135deg, #003399 0%, #0055cc 60%, #0077ff 100%)" }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
          style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wide mb-2">{t.contactTitle}</h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">{t.contactSubtitle}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Info Cards - يسار */}
        <div className="flex flex-col gap-4">
          {[
            {
              icon: "📧",
              title: lang === "ar" ? "البريد الإلكتروني" : lang === "nl" ? "E-mail" : lang === "fr" ? "E-mail" : "Email",
              value: "sewarrijbewijs@gmail.com",
              color: "#003399",
            },
            {
              icon: "⏰",
              title: lang === "ar" ? "ساعات العمل" : lang === "nl" ? "Openingstijden" : lang === "fr" ? "Horaires" : "Working Hours",
              value: lang === "ar" ? "الإثنين - الجمعة\n9:00 - 18:00" : lang === "nl" ? "Ma - Vr\n9:00 - 18:00" : lang === "fr" ? "Lun - Ven\n9:00 - 18:00" : "Mon - Fri\n9:00 - 18:00",
              color: "#0055cc",
            },
            {
              icon: "💬",
              title: lang === "ar" ? "رد سريع" : lang === "nl" ? "Snelle reactie" : lang === "fr" ? "Réponse rapide" : "Quick Reply",
              value: lang === "ar" ? "نرد خلال 24 ساعة" : lang === "nl" ? "Reactie binnen 24u" : lang === "fr" ? "Réponse en 24h" : "Reply within 24h",
              color: "#0077ff",
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${card.color}15` }}>
                {card.icon}
              </div>
              <div>
                <p className="font-black text-sm text-gray-500 uppercase tracking-wide mb-1">{card.title}</p>
                <p className="font-bold text-gray-800 text-sm whitespace-pre-line">{card.value}</p>
              </div>
            </div>
          ))}

          {/* Social / Extra */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="font-black text-sm text-gray-500 uppercase tracking-wide mb-3">
              {lang === "ar" ? "تابعنا" : lang === "nl" ? "Volg ons" : lang === "fr" ? "Suivez-nous" : "Follow us"}
            </p>
            <div className="flex gap-2">
              {["📘", "📸", "🐦"].map((icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-all"
                  style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form - يمين */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #003399, #0055cc)" }}>
            <h2 className="text-white font-black text-lg">
              {t.sendMessage}
            </h2>
            <p className="text-white/60 text-xs mt-0.5">
              {lang === "ar" ? "جميع الحقول المميزة بـ * إلزامية" : lang === "nl" ? "Velden met * zijn verplicht" : lang === "fr" ? "Les champs * sont obligatoires" : "Fields marked * are required"}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold bg-red-50 border-2 border-red-200 text-red-600 flex items-center gap-2">
                <span>❌</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold bg-green-50 border-2 border-green-200 text-green-700 flex items-center gap-2">
                <span>✅</span> {t.successMessageContact}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">{t.fullName} *</label>
                  <input type="text" name="name" placeholder={t.fullNamePlaceholderContact}
                    className={inputClass} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">{t.emailLabel} *</label>
                  <input type="email" name="email" placeholder={t.emailPlaceholder}
                    className={inputClass} value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">{t.phoneLabel}</label>
                  <input type="tel" name="phone" placeholder={t.phonePlaceholder}
                    className={inputClass} value={formData.phone} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">{t.subjectLabel}</label>
                  <select name="subject" className={inputClass} value={formData.subject} onChange={handleInputChange}>
                    <option value="">{t.selectSubject}</option>
                    <option value="subscription">{t.subjectSubscription}</option>
                    <option value="technical">{t.subjectTechnical}</option>
                    <option value="content">{t.subjectContent}</option>
                    <option value="payment">{t.subjectPayment}</option>
                    <option value="other">{t.subjectOther}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">{t.messageLabel} *</label>
                <textarea name="message" placeholder={t.messagePlaceholder}
                  className={`${inputClass} resize-none`} rows={5}
                  value={formData.message} onChange={handleInputChange} required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wide transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg, #003399, #0055cc)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.sending}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t.sendButton}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
