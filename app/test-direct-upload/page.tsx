"use client";

import { useState } from "react";

export default function TestDirectUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "فشل الرفع");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار رفع الصور</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">اختر صورة</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />

          {file && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                الملف: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {uploading ? "جاري الرفع..." : "رفع الصورة"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-red-600 mb-2">❌ خطأ</h3>
            <p className="text-red-800 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-600 mb-4">✅ نجح الرفع!</h3>
            <div className="mb-4">
              <img src={result.url} alt="Uploaded" className="max-w-full rounded" />
            </div>
            <div className="text-sm">
              <p className="mb-2">
                <strong>URL:</strong>{" "}
                <a href={result.url} target="_blank" className="text-blue-600 break-all">
                  {result.url}
                </a>
              </p>
              <p>
                <strong>Public ID:</strong> {result.publicId}
              </p>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">📋 تعليمات</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
            <li>افتح Console (F12) لرؤية الرسائل التفصيلية</li>
            <li>اختر صورة صغيرة (أقل من 5MB)</li>
            <li>اضغط "رفع الصورة"</li>
            <li>راقب الرسائل في Console</li>
          </ol>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-2">🔍 روابط مفيدة</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/api/test-cloudinary" target="_blank" className="text-blue-600 hover:underline">
                اختبار إعدادات Cloudinary
              </a>
            </li>
            <li>
              <a href="/api/verify-cloudinary" target="_blank" className="text-blue-600 hover:underline">
                التحقق من Environment Variables
              </a>
            </li>
            <li>
              <a href="https://console.cloudinary.com/" target="_blank" className="text-blue-600 hover:underline">
                Cloudinary Dashboard
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
