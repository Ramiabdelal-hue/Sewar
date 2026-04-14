-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "PraktijkQuestion_lessonId_idx" ON "PraktijkQuestion"("lessonId");

-- CreateIndex
CREATE INDEX "QuestionA_lessonId_idx" ON "QuestionA"("lessonId");

-- CreateIndex
CREATE INDEX "QuestionB_lessonId_idx" ON "QuestionB"("lessonId");

-- CreateIndex
CREATE INDEX "QuestionC_lessonId_idx" ON "QuestionC"("lessonId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_isActive_idx" ON "Subscription"("isActive");

-- CreateIndex
CREATE INDEX "Subscription_expiryDate_idx" ON "Subscription"("expiryDate");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_expiryDate_idx" ON "User"("expiryDate");
