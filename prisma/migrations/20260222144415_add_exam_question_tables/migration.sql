-- CreateTable
CREATE TABLE "ExamQuestionA" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestionA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestionB" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestionB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestionC" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestionC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExamQuestionA" ADD CONSTRAINT "ExamQuestionA_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestionB" ADD CONSTRAINT "ExamQuestionB_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonB"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestionC" ADD CONSTRAINT "ExamQuestionC_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LessonC"("id") ON DELETE CASCADE ON UPDATE CASCADE;
