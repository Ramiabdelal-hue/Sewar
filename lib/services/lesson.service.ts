/**
 * Lesson Service — Business Logic
 * كل منطق الدروس هنا، الـ API routes تستدعيه فقط
 */
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

type Category = "A" | "B" | "C";

function getModel(category: Category) {
  if (category === "A") return prisma.lessonA;
  if (category === "B") return prisma.lessonB;
  return prisma.lessonC;
}

export async function getLessons(category: Category, questionType?: string) {
  const where: Record<string, unknown> = {};
  if (questionType) where.questionType = questionType;
  return getModel(category).findMany({ where, orderBy: { id: "asc" } });
}

export async function createLesson(category: Category, title: string, description?: string | null, examLabel?: string | null) {
  const lesson = await getModel(category).create({
    data: { title, description: description || null, examLabel: examLabel || null },
  });
  revalidateTag("lessons");
  return lesson;
}

export async function updateLesson(category: Category, id: number, title: string, description?: string | null, examLabel?: string | null) {
  const lesson = await getModel(category).update({
    where: { id },
    data: { title, description: description || null, examLabel: examLabel || null },
  });
  revalidateTag("lessons");
  return lesson;
}

export async function deleteLesson(category: Category, id: number) {
  await getModel(category).delete({ where: { id } });
  revalidateTag("lessons");
}
