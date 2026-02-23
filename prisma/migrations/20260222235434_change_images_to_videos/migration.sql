/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `ExamQuestionA` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `ExamQuestionB` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `ExamQuestionC` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `QuestionA` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `QuestionB` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `QuestionC` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExamQuestionA" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "ExamQuestionB" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "ExamQuestionC" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "QuestionA" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "QuestionB" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "QuestionC" DROP COLUMN "imageUrls",
ADD COLUMN     "videoUrls" TEXT[];
