-- CreateTable
CREATE TABLE "quest_monday" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Suspect Line-Up',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_monday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_monday_levels" (
    "id" TEXT NOT NULL,
    "questMondayId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_monday_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_monday_suspects" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "suspectNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_monday_suspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_monday_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questMondayId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "completedLevels" JSONB NOT NULL DEFAULT '[]',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_monday_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_monday_levels_questMondayId_idx" ON "quest_monday_levels"("questMondayId");

-- CreateIndex
CREATE INDEX "quest_monday_levels_levelNumber_idx" ON "quest_monday_levels"("levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quest_monday_levels_questMondayId_levelNumber_key" ON "quest_monday_levels"("questMondayId", "levelNumber");

-- CreateIndex
CREATE INDEX "quest_monday_suspects_levelId_idx" ON "quest_monday_suspects"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "quest_monday_suspects_levelId_suspectNumber_key" ON "quest_monday_suspects"("levelId", "suspectNumber");

-- CreateIndex
CREATE INDEX "quest_monday_progress_userId_idx" ON "quest_monday_progress"("userId");

-- CreateIndex
CREATE INDEX "quest_monday_progress_questMondayId_idx" ON "quest_monday_progress"("questMondayId");

-- CreateIndex
CREATE INDEX "quest_monday_progress_isCompleted_idx" ON "quest_monday_progress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "quest_monday_progress_userId_questMondayId_key" ON "quest_monday_progress"("userId", "questMondayId");

-- AddForeignKey
ALTER TABLE "quest_monday_levels" ADD CONSTRAINT "quest_monday_levels_questMondayId_fkey" FOREIGN KEY ("questMondayId") REFERENCES "quest_monday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_monday_suspects" ADD CONSTRAINT "quest_monday_suspects_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "quest_monday_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_monday_progress" ADD CONSTRAINT "quest_monday_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_monday_progress" ADD CONSTRAINT "quest_monday_progress_questMondayId_fkey" FOREIGN KEY ("questMondayId") REFERENCES "quest_monday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
