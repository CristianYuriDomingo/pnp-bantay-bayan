-- CreateTable
CREATE TABLE "quest_friday" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Guess The Rank',
    "instruction" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_friday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_friday_rank_options" (
    "id" TEXT NOT NULL,
    "questFridayId" TEXT NOT NULL,
    "rankName" TEXT NOT NULL,
    "rankImage" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_friday_rank_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_friday_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questFridayId" TEXT NOT NULL,
    "selectedRank" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_friday_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_friday_rank_options_questFridayId_idx" ON "quest_friday_rank_options"("questFridayId");

-- CreateIndex
CREATE INDEX "quest_friday_rank_options_orderIndex_idx" ON "quest_friday_rank_options"("orderIndex");

-- CreateIndex
CREATE INDEX "quest_friday_progress_userId_idx" ON "quest_friday_progress"("userId");

-- CreateIndex
CREATE INDEX "quest_friday_progress_questFridayId_idx" ON "quest_friday_progress"("questFridayId");

-- CreateIndex
CREATE INDEX "quest_friday_progress_isCompleted_idx" ON "quest_friday_progress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "quest_friday_progress_userId_questFridayId_key" ON "quest_friday_progress"("userId", "questFridayId");

-- AddForeignKey
ALTER TABLE "quest_friday_rank_options" ADD CONSTRAINT "quest_friday_rank_options_questFridayId_fkey" FOREIGN KEY ("questFridayId") REFERENCES "quest_friday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_friday_progress" ADD CONSTRAINT "quest_friday_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_friday_progress" ADD CONSTRAINT "quest_friday_progress_questFridayId_fkey" FOREIGN KEY ("questFridayId") REFERENCES "quest_friday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
