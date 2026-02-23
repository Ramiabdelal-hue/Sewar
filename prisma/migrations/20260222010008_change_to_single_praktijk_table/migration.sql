/*
  Warnings:

  - You are about to drop the `PraktijkLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PraktijkQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PraktijkQuestion" DROP CONSTRAINT "PraktijkQuestion_lessonId_fkey";

-- DropTable
DROP TABLE "PraktijkLesson";

-- DropTable
DROP TABLE "PraktijkQuestion";

-- CreateTable
CREATE TABLE "Praktijk" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT,
    "textNL" TEXT,
    "textFR" TEXT,
    "textAR" TEXT,
    "imageUrls" TEXT[],
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Praktijk_pkey" PRIMARY KEY ("id")
);
