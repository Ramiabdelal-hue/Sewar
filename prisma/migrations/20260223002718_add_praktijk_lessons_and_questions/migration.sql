/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Praktijk` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Praktijk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Praktijk" DROP COLUMN "imageUrls",
DROP COLUMN "videoUrl",
ADD COLUMN     "videoUrls" TEXT[];

-- CreateTable
CREATE TABLE "PraktijkLesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PraktijkLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PraktijkQuestion" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "textNL" TEXT,
    "textFR" TEXT,
    "textAR" TEXT,
    "videoUrls" TEXT[],
    "audioUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PraktijkQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PraktijkQuestion" ADD CONSTRAINT "PraktijkQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "PraktijkLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
