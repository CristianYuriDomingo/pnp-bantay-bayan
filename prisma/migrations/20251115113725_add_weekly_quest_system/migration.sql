-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastQuestCompletedAt" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
ADD COLUMN     "weeklyQuestStartDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "weekly_quest_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "completedDays" JSONB NOT NULL DEFAULT '[]',
    "totalQuestsCompleted" INTEGER NOT NULL DEFAULT 0,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_quest_progress_userId_idx" ON "weekly_quest_progress"("userId");

-- CreateIndex
CREATE INDEX "weekly_quest_progress_weekStartDate_idx" ON "weekly_quest_progress"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_quest_progress_userId_weekStartDate_key" ON "weekly_quest_progress"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "User_weeklyQuestStartDate_idx" ON "User"("weeklyQuestStartDate");

-- AddForeignKey
ALTER TABLE "weekly_quest_progress" ADD CONSTRAINT "weekly_quest_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
