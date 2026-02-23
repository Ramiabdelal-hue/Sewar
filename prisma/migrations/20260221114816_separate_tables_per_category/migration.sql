-- CreateTable
CREATE TABLE "QuestionA" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "textFR" TEXT,
    "textAR" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionB" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "textFR" TEXT,
    "textAR" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionC" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "textFR" TEXT,
    "textAR" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonA" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "questionType" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonB" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "questionType" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonC" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "questionType" TEXT,
    "description" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionA" ADD CONSTRAINT "QuestionA_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionB" ADD CONSTRAINT "QuestionB_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonB"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionC" ADD CONSTRAINT "QuestionC_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonC"("id") ON DELETE CASCADE ON UPDATE CASCADE;
