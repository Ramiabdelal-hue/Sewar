"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export default function ContactPage() {
  const { lang, setLang } = useLang();
  const translations: any = { nl, fr, ar, en };
  const t = translations[lang];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setError(t.errorMessage);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
        
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(data.message || t.errorMessage);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header - محسّن للموبايل */}
      <div className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl sm:text-3xl">{t.contactTitle}</span>
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">{t.contactSubtitle}</p>
            </div>
            
            {/* Language Buttons & Back - محسّن للموبايل */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <button onClick={() => setLang("nl")} className={`px-3 py-2 text-sm sm:text-base rounded-full font-semibold transition ${lang === "nl" ? "bg-gradient-to-r from-red-500 to-yellow-400 text-white" : "bg-gray-200 text-gray-600"}`}>NL</button>
                <button onClick={() => setLang("fr")} className={`px-3 py-2 text-sm sm:text-base rounded-full font-semibold transition ${lang === "fr" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-gray-200 text-gray-600"}`}>FR</button>
                <button onClick={() => setLang("ar")} className={`px-3 py-2 text-sm sm:text-base rounded-full font-semibold transition ${lang === "ar" ? "bg-gradient-to-r from-green-400 to-cyan-400 text-white" : "bg-gray-200 text-gray-600"}`}>AR</button>
                <button onClick={() => setLang("en")} className={`px-3 py-2 text-sm sm:text-base rounded-full font-semibold transition ${lang === "en" ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white" : "bg-gray-200 text-gray-600"}`}>EN</button>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium text-sm sm:text-base"
              >
                {t.backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Contact Form - محسّن للموبايل */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">{t.sendMessage}</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
              {t.successMessageContact}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.fullName} *
              </label>
              <input
                type="text"
                name="name"
                placeholder={t.fullNamePlaceholderContact}
                className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.emailLabel} *
              </label>
              <input
                type="email"
                name="email"
                placeholder={t.emailPlaceholder}
                className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                name="phone"
                placeholder={t.phonePlaceholder}
                className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.subjectLabel}
              </label>
              <select
                name="subject"
                className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                value={formData.subject}
                onChange={handleInputChange}
              >
                <option value="">{t.selectSubject}</option>
                <option value="subscription">{t.subjectSubscription}</option>
                <option value="technical">{t.subjectTechnical}</option>
                <option value="content">{t.subjectContent}</option>
                <option value="payment">{t.subjectPayment}</option>
                <option value="other">{t.subjectOther}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.messageLabel} *
              </label>
              <textarea
                name="message"
                placeholder={t.messagePlaceholder}
                className="w-full p-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? t.sending : t.sendButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
