# Exam Questions Fix - Prisma Client Cache Issue

## Problem
When trying to save exam questions, the system was throwing an error:
```
Argument 'exam' is missing
```

Then after fixing, another error appeared:
```
The column `lessonId` does not exist in the current database.
```

## Root Causes
1. The Prisma Client was cached with an old schema where `ExamQuestionA/B/C` tables had a relation to `ExamA/B/C` tables (which were deleted)
2. The `ExamQuestionA/B/C` tables didn't exist in the database - they needed to be created via migration
3. The seed file was trying to seed `ExamA/B/C` tables that no longer exist in the schema

## Solutions Applied

### 1. Created Migration for ExamQuestion Tables
Created a new migration to add `ExamQuestionA/B/C` tables to the database:
```bash
npx prisma migrate dev --name add_exam_question_tables
```

This created tables with the following structure:
- `ExamQuestionA` linked to `LessonA` via `lessonId`
- `ExamQuestionB` linked to `LessonB` via `lessonId`
- `ExamQuestionC` linked to `LessonC` via `lessonId`

### 2. Fixed Seed File
Removed references to `ExamA/B/C` tables from `prisma/seed.ts` since these tables no longer exist in the schema.

### 3. Regenerated Prisma Client
```bash
npm install @prisma/client prisma
npx prisma generate
```

### 4. Cleared Next.js Cache
```bash
Remove-Item -Recurse -Force .next
```

## Current Schema Structure
```prisma
model ExamQuestionA {
  id            Int      @id @default(autoincrement())
  text          String
  textNL        String?
  imageUrls     String[]
  audioUrl      String?
  answer1       String?
  answer2       String?
  answer3       String?
  correctAnswer Int?
  lessonId      Int
  createdAt     DateTime @default(now())
  lesson        LessonA  @relation("ExamQuestionsA", fields: [lessonId], references: [id], onDelete: Cascade)
}
```

Same structure for `ExamQuestionB` and `ExamQuestionC`, linked to `LessonB` and `LessonC` respectively.

## How It Works Now
1. Admin selects category (A, B, or C)
2. System fetches lessons from `LessonA/B/C` tables via `/api/lessons?category=A`
3. Admin selects a lesson from the dropdown
4. Admin adds exam question with:
   - Question text in Dutch only (`textNL`)
   - 3 answer choices
   - Correct answer selection
   - Optional images and audio
5. Question is saved to the appropriate `ExamQuestionA/B/C` table based on the lesson's category
6. The API determines the category by checking which table contains the `lessonId`

## Testing Steps
1. Stop any running dev server (Ctrl+C)
2. Start the development server: `npm run dev`
3. Login to admin panel (rami@gmail.com / 123)
4. Select "Examen" question type
5. Select a category (A, B, or C)
6. Select a lesson from the dropdown (should show 13 lessons)
7. Add an exam question with:
   - Dutch text
   - 3 answers
   - Select correct answer
   - Optional: add images
8. Click save
9. Check that the question appears in the list below

## Important Notes
- Exam questions are saved in `ExamQuestionA/B/C` tables (separate from theory questions)
- Theory questions are saved in `QuestionA/B/C` tables
- Both types are linked to lessons via `lessonId`
- Exam questions only require Dutch text (`textNL`) and 3 answer choices
- Theory questions support 3 languages (NL, FR, AR) and explanations
- The database has been seeded with 13 lessons per category (A, B, C)
- Each category has 12 theory lessons + 1 exam lesson

## Files Modified
- `prisma/schema.prisma` - Added `ExamQuestionA/B/C` models
- `prisma/seed.ts` - Removed `ExamA/B/C` seeding code
- `prisma/migrations/20260222144415_add_exam_question_tables/migration.sql` - New migration
- `app/api/exam-questions/route.ts` - API for exam questions (already correct)
- `app/admin/questions/page.tsx` - Admin page (already correct)
