-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeen" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastSeen_idx" ON "User"("lastSeen");
