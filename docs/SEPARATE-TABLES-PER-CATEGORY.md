# Separate Tables Per Category Implementation

## Overview
The database has been restructured to have separate Lesson and Question tables for each category (A, B, C). The old unified Lesson and Question tables have been completely removed.

## Database Schema

### Current Tables (Category-Specific)
- **LessonA** / **QuestionA** - For motorcycle category (A)
- **LessonB** / **QuestionB** - For car category (B)  
- **LessonC** / **QuestionC** - For truck category (C)

### Removed Tables
- ~~**Lesson**~~ - Old unified lesson table (DELETED)
- ~~**Question**~~ - Old unified question table (DELETED)

## Migrations Applied
1. `20260221114816_separate_tables_per_category` - Created separate tables
2. `20260221120004_remove_old_lesson_question_tables` - Removed old tables

## Files Updated

### 1. Prisma Schema (`prisma/schema.prisma`)
- Removed Lesson and Question models completely
- Only LessonA/B/C and QuestionA/B/C models remain
- Each category has its own isolated tables with proper relations

### 2. Seed File (`prisma/seed.ts`)
- Populates LessonA, LessonB, LessonC tables separately
- No category field needed (tables are separated)
- Successfully seeded 13 lessons for each category

### 3. Lessons API (`app/api/lessons/route.ts`)
- GET endpoint queries correct table based on category parameter
- Routes to LessonA, LessonB, or LessonC based on category
- Returns error if invalid category provided

### 4. Questions API (`app/api/questions/route.ts`)
- Completely rewritten to support category-specific tables only
- Helper functions:
  - `getCategoryFromLessonId()` - Determines category from lesson ID
  - `getLessonModel()` - Returns correct Prisma model for lessons
  - `getQuestionModel()` - Returns correct Prisma model for questions
- GET: Fetches questions from correct table based on lessonId
- POST: Creates questions in correct table based on lessonId
- DELETE: Searches all category tables to find and delete question

### 5. Exam Test Page (`app/examen/test/page.tsx`)
- Updated to use lessonId instead of lesson name
- Maps category to exam lesson ID:
  - Category A → lessonId 20
  - Category B → lessonId 32
  - Category C → lessonId 45
- Fetches questions using `/api/questions?lessonId=X`

### 6. Lesson View Page (`app/lessons/view/page.tsx`)
- Already using lessonId parameter
- Works correctly with new API structure
- No changes needed

### 7. Lessons Page (`app/lessons/page.tsx`)
- Already using category-based API
- Fetches lessons using `/api/lessons?category=X`
- No changes needed

### 8. Admin Questions Page (`app/admin/questions/page.tsx`)
- Uses lessonId to save questions
- Automatically routes to correct table based on selected lesson
- No changes needed

## How It Works

### Admin Adding Questions
1. Admin selects category (A, B, or C)
2. Admin selects lesson from that category (by ID)
3. Question is saved to the corresponding QuestionA/B/C table
4. The API automatically determines the category from the lessonId

### Users Viewing Lessons
1. User's subscription determines their category
2. Frontend fetches lessons from correct table (LessonA/B/C)
3. Questions are fetched from corresponding QuestionA/B/C table using lessonId

### Exam System
1. Exam questions are stored in the same category-specific tables
2. Questions with `questionType: "Examen"` are exam questions
3. Exam lesson IDs:
   - Category A: lessonId 20
   - Category B: lessonId 32
   - Category C: lessonId 45

## Benefits

1. **Complete Data Isolation**: Each category's data is completely separate
2. **Better Performance**: Queries are faster as they search smaller tables
3. **Scalability**: Easy to add new categories in the future
4. **Code Clarity**: Clear separation makes the codebase easier to understand
5. **No Legacy Code**: Old tables removed, no confusion about which to use

## Lesson IDs by Category

### Category A (Motorcycles): IDs 4, 9-20
- 4: Motorfiets wetgeving (A) - Introductie
- 9-19: Theory lessons
- 20: Proefexamen categorie A (EXAM)

### Category B (Cars): IDs 6, 21-32
- 6: Auto wetgeving (B) - Introductie
- 21-31: Theory lessons
- 32: Proefexamen categorie B (EXAM)

### Category C (Trucks): IDs 33-45
- 33-44: Theory lessons
- 45: Proefexamen categorie C (EXAM)

## Testing Checklist

✅ Database migration successful
✅ Old tables removed
✅ Seed file populates all category tables
✅ Lessons API returns correct lessons per category
✅ Questions API saves to correct table
✅ Questions API fetches from correct table
✅ Admin panel works with new structure
✅ Lesson view page works correctly
✅ Exam test page works correctly
✅ All old helper files removed

## API Endpoints

### Get Lessons by Category
```
GET /api/lessons?category=A
GET /api/lessons?category=B
GET /api/lessons?category=C
```

### Get Questions by Lesson ID
```
GET /api/questions?lessonId=20
```

### Create Question
```
POST /api/questions
Body: FormData with lessonId, text fields, images, audio, etc.
```

### Delete Question
```
DELETE /api/questions?id=123
```

## Notes

- All old Lesson and Question references have been removed
- System now exclusively uses category-specific tables
- No backward compatibility with old table structure
- All APIs updated and tested
- Frontend components work seamlessly with new structure
