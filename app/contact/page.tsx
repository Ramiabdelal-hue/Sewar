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
      <div className="w-full py-10 px-4 text-center" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 60%, #4c1d95 100%)" }}>
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
              {/* WhatsApp */}
              <a href="https://wa.me/32470813725" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:scale-110 transition-all"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/g/1BD1M2WHDY/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:scale-110 transition-all"
                style={{ background: "linear-gradient(135deg, #1877F2, #0a5dc2)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/sewar_ashour" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@sewar_ashour_" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:scale-110 transition-all"
                style={{ background: "linear-gradient(135deg, #010101, #333)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Form - يمين */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
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
                style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
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
