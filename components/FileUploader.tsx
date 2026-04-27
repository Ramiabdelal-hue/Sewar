"use client";

import { useState } from "react";
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface FileUploaderProps {
  type: "image" | "video" | "audio";
  onUploadComplete: (url: string, publicId: string) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

export default function FileUploader({
  type,
  onUploadComplete,
  accept,
  maxSizeMB = 100,
  multiple = false,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // التحقق من الحجم
    for (const file of files) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`الملف "${file.name}" كبير جداً. الحد الأقصى ${maxSizeMB}MB`);
        return;
      }
    }

    setUploading(true);
    setError("");
    setSuccess(false);
    setProgress(0);
    setUploadedCount(0);
    setTotalCount(files.length);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        console.log(`🔄 رفع الملف ${i + 1}/${files.length}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "",
          },
          body: formData,
        });

        console.log(`📡 استجابة الخادم:`, response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "خطأ غير معروف" }));
          console.error("❌ خطأ من الخادم:", errorData);
          throw new Error(errorData.error || `فشل الرفع: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ تم الرفع بنجاح:", data.url);
        
        onUploadComplete(data.url, data.publicId);
        setUploadedCount(i + 1);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
        setUploadedCount(0);
        setTotalCount(0);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء رفع الملف";
      setError(errorMessage);
      console.error("❌ خطأ في رفع الملف:", err);
    } finally {
      setUploading(false);
      // reset input
      e.target.value = "";
    }
  };

  const getAcceptType = () => {
    if (accept) return accept;
    switch (type) {
      case "image": return "image/*";
      case "video": return "video/*";
      case "audio": return "audio/*";
      default: return "*/*";
    }
  };

  const getLabel = () => {
    switch (type) {
      case "image": return multiple ? "رفع صور (يمكن اختيار أكثر من صورة)" : "رفع صورة";
      case "video": return multiple ? "رفع فيديوهات" : "رفع فيديو";
      case "audio": return "رفع صوت";
      default: return "رفع ملف";
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <FaSpinner className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">
                {totalCount > 1
                  ? `جاري رفع ${uploadedCount} / ${totalCount}...`
                  : `جاري الرفع... ${progress}%`}
              </p>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : success ? (
            <>
              <FaCheckCircle className="w-8 h-8 mb-2 text-green-500" />
              <p className="text-sm text-green-600">
                {totalCount > 1 ? `تم رفع ${totalCount} ملفات بنجاح!` : "تم الرفع بنجاح!"}
              </p>
            </>
          ) : (
            <>
              <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-600 text-center px-2">
                <span className="font-semibold">{getLabel()}</span>
              </p>
              {multiple && (
                <p className="text-xs text-blue-500 font-bold">📎 اضغط لاختيار أكثر من ملف</p>
              )}
              <p className="text-xs text-gray-500">الحد الأقصى: {maxSizeMB}MB لكل ملف</p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept={getAcceptType()}
          onChange={handleUpload}
          disabled={uploading}
          multiple={multiple}
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
