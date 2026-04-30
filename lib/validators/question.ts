/**
 * Validators — Question
 * التحقق من صحة بيانات الأسئلة
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface QuestionInput {
  lessonId: number;
  category: string;
  text?: string;
  textNL?: string;
  textFR?: string;
  textAR?: string;
  explanationNL?: string;
  explanationFR?: string;
  explanationAR?: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  correctAnswer?: number;
  videoUrls?: string[];
  audioUrl?: string;
  isFree?: boolean;
  points?: number;
}

export function validateQuestion(data: unknown): { valid: true; data: QuestionInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const d = data as Record<string, unknown>;

  if (!d || typeof d !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Invalid request body" }] };
  }

  const lessonId = typeof d.lessonId === "string" ? parseInt(d.lessonId) : Number(d.lessonId);
  if (!lessonId || isNaN(lessonId) || lessonId <= 0) {
    errors.push({ field: "lessonId", message: "lessonId غير صالح" });
  }

  if (!d.category || typeof d.category !== "string") {
    errors.push({ field: "category", message: "الفئة مطلوبة" });
  } else if (!["A", "B", "C"].includes(d.category.toUpperCase())) {
    errors.push({ field: "category", message: "الفئة يجب أن تكون A أو B أو C" });
  }

  if (d.videoUrls !== undefined) {
    if (!Array.isArray(d.videoUrls)) {
      errors.push({ field: "videoUrls", message: "videoUrls يجب أن يكون مصفوفة" });
    } else if (d.videoUrls.length > 10) {
      errors.push({ field: "videoUrls", message: "الحد الأقصى 10 فيديوهات" });
    }
  }

  if (d.points !== undefined) {
    const points = Number(d.points);
    if (isNaN(points) || points < 1 || points > 5) {
      errors.push({ field: "points", message: "النقاط يجب أن تكون بين 1 و 5" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      lessonId,
      category: (d.category as string).toUpperCase(),
      text: d.text ? String(d.text).slice(0, 2000) : undefined,
      textNL: d.textNL ? String(d.textNL).slice(0, 2000) : undefined,
      textFR: d.textFR ? String(d.textFR).slice(0, 2000) : undefined,
      textAR: d.textAR ? String(d.textAR).slice(0, 2000) : undefined,
      explanationNL: d.explanationNL ? String(d.explanationNL).slice(0, 3000) : undefined,
      explanationFR: d.explanationFR ? String(d.explanationFR).slice(0, 3000) : undefined,
      explanationAR: d.explanationAR ? String(d.explanationAR).slice(0, 3000) : undefined,
      answer1: d.answer1 ? String(d.answer1).slice(0, 500) : undefined,
      answer2: d.answer2 ? String(d.answer2).slice(0, 500) : undefined,
      answer3: d.answer3 ? String(d.answer3).slice(0, 500) : undefined,
      correctAnswer: d.correctAnswer !== undefined ? Number(d.correctAnswer) : undefined,
      videoUrls: Array.isArray(d.videoUrls) ? d.videoUrls.map(String) : [],
      audioUrl: d.audioUrl ? String(d.audioUrl).slice(0, 500) : undefined,
      isFree: Boolean(d.isFree),
      points: d.points !== undefined ? Number(d.points) : 1,
    },
  };
}
