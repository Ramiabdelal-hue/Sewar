/**
 * Upload Service — Business Logic
 * رفع الملفات إلى Cloudinary
 */
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateImage, validateVideo, validateAudio } from "@/lib/fileValidation";

export type UploadType = "image" | "video" | "audio";

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  type: UploadType,
  folder = "sewar"
): Promise<UploadResult> {
  // التحقق من الملف
  let validation;
  if (type === "image") validation = validateImage(file);
  else if (type === "video") validation = validateVideo(file);
  else validation = validateAudio(file);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await uploadToCloudinary(file, folder);
    return { success: true, url: result.url, publicId: result.publicId };
  } catch (err) {
    console.error("uploadFile error:", err);
    return { success: false, error: "فشل رفع الملف" };
  }
}
