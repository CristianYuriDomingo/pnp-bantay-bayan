-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentRank" TEXT NOT NULL DEFAULT 'Pat',
ADD COLUMN     "highestRankEver" TEXT NOT NULL DEFAULT 'Pat',
ADD COLUMN     "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "leaderboardPosition" INTEGER,
ADD COLUMN     "rankAchievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rankHistory" JSONB;

-- CreateIndex
CREATE INDEX "User_currentRank_idx" ON "User"("currentRank");

-- CreateIndex
CREATE INDEX "User_leaderboardPosition_idx" ON "User"("leaderboardPosition");
