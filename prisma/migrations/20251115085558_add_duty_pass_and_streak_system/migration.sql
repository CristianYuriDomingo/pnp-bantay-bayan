-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dutyPassUsedDates" JSONB DEFAULT '[]',
ADD COLUMN     "dutyPasses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDutyPassClaim" TIMESTAMP(3),
ADD COLUMN     "lastStreakUpdate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakProtectedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastDutyPassClaim_idx" ON "User"("lastDutyPassClaim");

-- CreateIndex
CREATE INDEX "User_currentStreak_idx" ON "User"("currentStreak");

-- CreateIndex
CREATE INDEX "User_lastStreakUpdate_idx" ON "User"("lastStreakUpdate");
