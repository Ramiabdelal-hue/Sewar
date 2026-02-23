# Database Structure - Category-Specific Tables

## Overview
The S & A Rijacademie system uses a category-specific database structure where each vehicle category (A, B, C) has its own separate tables for lessons and questions.

## Database Tables

### Category A (Motorcycles)
- **LessonA** - Contains all lessons for motorcycle category
- **QuestionA** - Contains all questions for motorcycle lessons

### Category B (Cars)
- **LessonB** - Contains all lessons for car category
- **QuestionB** - Contains all questions for car lessons

### Category C (Trucks)
- **LessonC** - Contains all lessons for truck category
- **QuestionC** - Contains all questions for truck lessons

### Shared Tables
- **User** - User accounts and authentication
- **Subscription** - User subscriptions (supports multiple categories)
- **ExamResult** - Exam results for all categories

## Table Schemas

### LessonA / LessonB / LessonC
```prisma
model LessonA {
  id           Int         @id @default(autoincrement())
  title        String      // Lesson title
  questionType String?     // "Theori" or "Examen"
  description  String?     // Lesson description
  videoUrl     String?     // Video URL
  questions    QuestionA[] // Related questions
  createdAt    DateTime    @default(now())
}
```

### QuestionA / QuestionB / QuestionC
```prisma
model QuestionA {
  id            Int      @id @default(autoincrement())
  text          String   // Default question text
  textNL        String?  // Dutch translation
  textFR        String?  // French translation
  textAR        String?  // Arabic translation
  imageUrls     String[] // Multiple images
  audioUrl      String?  // Audio file
  explanationNL String?  // Dutch explanation
  explanationFR String?  // French explanation
  explanationAR String?  // Arabic explanation
  answer1       String?  // Answer 1 (for exams)
  answer2       String?  // Answer 2 (for exams)
  answer3       String?  // Answer 3 (for exams)
  correctAnswer Int?     // Correct answer number (1, 2, or 3)
  lesson        LessonA  @relation(fields: [lessonId], references: [id])
  lessonId      Int      // Foreign key to LessonA
  createdAt     DateTime @default(now())
}
```

## Lesson IDs

### Category A (Motorcycles)
| ID | Title | Type |
|----|-------|------|
| 4 | Motorfiets wetgeving (A) - Introductie | Theori |
| 9 | Veiligheidsuitrusting en helm | Theori |
| 10 | Balans en manoeuvres op de weg | Theori |
| 11 | Correcte positionering in de rijstrook | Theori |
| 12 | Verkeersborden specifiek voor motoren | Theori |
| 13 | Omgaan met bochten en gladde oppervlakken | Theori |
| 14 | Passagiers en lading op de motor | Theori |
| 15 | Basis motorfiets mechanica | Theori |
| 16 | Zicht en dode hoeken voor motoren | Theori |
| 17 | Snelheidsregels voor lichte motoren | Theori |
| 18 | Eerste hulp voor motorrijders | Theori |
| 19 | Rijden in groepen | Theori |
| **20** | **Proefexamen categorie A** | **Examen** |

### Category B (Cars)
| ID | Title | Type |
|----|-------|------|
| 6 | Auto wetgeving (B) - Introductie | Theori |
| 21 | Snelheden binnen en buiten de stad | Theori |
| 22 | Voorrangsregels en kruispunten | Theori |
| 23 | Verticale verkeersborden | Theori |
| 24 | Wegmarkeringen en lijnen | Theori |
| 25 | Correct parkeren en stoppen | Theori |
| 26 | Veilig inhalen en manoeuvres | Theori |
| 27 | Lichte auto mechanica | Theori |
| 28 | Zicht en rijden in moeilijke omstandigheden | Theori |
| 29 | Economisch rijden (Eco-Driving) | Theori |
| 30 | Ongevallen en wettelijke aansprakelijkheid | Theori |
| 31 | Kwetsbare weggebruikers (voetgangers) | Theori |
| **32** | **Proefexamen categorie B** | **Examen** |

### Category C (Trucks)
| ID | Title | Type |
|----|-------|------|
| 33 | Vrachtwagen wetgeving (C) - Gewichten en afmetingen | Theori |
| 34 | Tachograaf en rusttijden | Theori |
| 35 | Ladingverdeling en lading beveiligen | Theori |
| 36 | Zware voertuig mechanica | Theori |
| 37 | Luchtremsystemen (Air Brakes) | Theori |
| 38 | Dode hoeken in grote voertuigen | Theori |
| 39 | Verkeersregels voor zwaar transport | Theori |
| 40 | Verboden wegen en hoogtebeperkingen | Theori |
| 41 | Internationale documenten en carnets | Theori |
| 42 | Banden vervangen en pech afhandelen | Theori |
| 43 | Veilig laden en lossen | Theori |
| 44 | Pre-trip inspectie voor vrachtwagens | Theori |
| **45** | **Proefexamen categorie C** | **Examen** |

## Question Types

### Theory Questions (Theori)
- Have question text in 3 languages (NL, FR, AR)
- Have explanation in 3 languages (NL, FR, AR)
- May have multiple images
- May have audio file
- **No answer choices** (explanatory content only)

### Exam Questions (Examen)
- Have question text in **Dutch only** (NL)
- Have 3 answer choices (answer1, answer2, answer3)
- Have correct answer indicator (1, 2, or 3)
- May have multiple images
- May have audio file
- **No explanations** (test format)

## Data Flow

### Adding Questions (Admin)
1. Admin selects category (A, B, or C)
2. Admin selects lesson by ID
3. System determines category from lessonId
4. Question saved to QuestionA/B/C table

### Viewing Lessons (User)
1. User subscription determines category
2. System fetches from LessonA/B/C table
3. Questions fetched from QuestionA/B/C table

### Taking Exams (User)
1. User selects category
2. System loads exam lesson (ID 20/32/45)
3. Questions fetched from QuestionA/B/C table
4. Results saved to ExamResult table

## Benefits of This Structure

1. **Complete Isolation**: Each category's data is completely separate
2. **Better Performance**: Smaller tables = faster queries
3. **Easier Maintenance**: Clear separation of concerns
4. **Scalability**: Easy to add new categories (D, E, etc.)
5. **Data Integrity**: No cross-category data contamination

## Database Commands

### View Data
```bash
# Open Prisma Studio
npx prisma studio

# Run seed
npx tsx prisma/seed.ts
```

### Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Notes

- Old unified Lesson and Question tables have been removed
- All APIs use category-specific tables exclusively
- No backward compatibility with old structure
- System tested and verified working correctly
