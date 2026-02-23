/*
  Warnings:

  - Added the required column `answers` to the `ExamResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamResult" ADD COLUMN     "answers" JSONB NOT NULL;
