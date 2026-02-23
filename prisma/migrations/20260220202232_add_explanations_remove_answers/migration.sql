/*
  Warnings:

  - You are about to drop the column `answer1` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `answer2` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `answer3` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer1",
DROP COLUMN "answer2",
DROP COLUMN "answer3",
DROP COLUMN "correctAnswer",
ADD COLUMN     "explanationAR" TEXT,
ADD COLUMN     "explanationFR" TEXT,
ADD COLUMN     "explanationNL" TEXT;
