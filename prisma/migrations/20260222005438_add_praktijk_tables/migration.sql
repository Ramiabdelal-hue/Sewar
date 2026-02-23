-- CreateTable
CREATE TABLE "PraktijkLesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
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
    "imageUrls" TEXT[],
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "explanationNL" TEXT,
    "explanationFR" TEXT,
    "explanationAR" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "correctAnswer" INTEGER,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PraktijkQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PraktijkQuestion" ADD CONSTRAINT "PraktijkQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "PraktijkLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
