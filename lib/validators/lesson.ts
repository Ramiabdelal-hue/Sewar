/**
 * Validators — Lesson
 * التحقق من صحة بيانات الدروس
 */

export interface LessonInput {
  title: string;
  description?: string | null;
  category: string;
}

export interface LessonUpdateInput extends LessonInput {
  id: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLesson(data: unknown): { valid: true; data: LessonInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const d = data as Record<string, unknown>;

  if (!d || typeof d !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Invalid request body" }] };
  }

  if (!d.title || typeof d.title !== "string" || !d.title.trim()) {
    errors.push({ field: "title", message: "العنوان مطلوب" });
  } else if (d.title.length > 300) {
    errors.push({ field: "title", message: "العنوان طويل جداً (300 حرف كحد أقصى)" });
  }

  if (!d.category || typeof d.category !== "string") {
    errors.push({ field: "category", message: "الفئة مطلوبة" });
  } else if (!["A", "B", "C"].includes(d.category.toUpperCase())) {
    errors.push({ field: "category", message: "الفئة يجب أن تكون A أو B أو C" });
  }

  if (d.description !== undefined && d.description !== null) {
    if (typeof d.description !== "string") {
      errors.push({ field: "description", message: "الوصف يجب أن يكون نصاً" });
    } else if (d.description.length > 500) {
      errors.push({ field: "description", message: "الوصف طويل جداً (500 حرف كحد أقصى)" });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      title: (d.title as string).trim(),
      description: d.description ? (d.description as string).trim() : null,
      category: (d.category as string).toUpperCase(),
    },
  };
}

export function validateLessonUpdate(data: unknown): { valid: true; data: LessonUpdateInput } | { valid: false; errors: ValidationError[] } {
  const d = data as Record<string, unknown>;
  const base = validateLesson(data);
  if (!base.valid) return base;

  const id = typeof d.id === "string" ? parseInt(d.id) : Number(d.id);
  if (!id || isNaN(id) || id <= 0) {
    return { valid: false, errors: [{ field: "id", message: "ID غير صالح" }] };
  }

  return { valid: true, data: { ...base.data, id } };
}
