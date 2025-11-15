-- CreateTable
CREATE TABLE "quest_wednesday" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Code the Call',
    "description" TEXT NOT NULL,
    "networkName" TEXT NOT NULL,
    "correctNumber" TEXT NOT NULL,
    "shuffledDigits" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_wednesday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_wednesday_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questWednesdayId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_wednesday_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_wednesday_progress_userId_idx" ON "quest_wednesday_progress"("userId");

-- CreateIndex
CREATE INDEX "quest_wednesday_progress_questWednesdayId_idx" ON "quest_wednesday_progress"("questWednesdayId");

-- CreateIndex
CREATE INDEX "quest_wednesday_progress_isCompleted_idx" ON "quest_wednesday_progress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "quest_wednesday_progress_userId_questWednesdayId_key" ON "quest_wednesday_progress"("userId", "questWednesdayId");

-- AddForeignKey
ALTER TABLE "quest_wednesday_progress" ADD CONSTRAINT "quest_wednesday_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_wednesday_progress" ADD CONSTRAINT "quest_wednesday_progress_questWednesdayId_fkey" FOREIGN KEY ("questWednesdayId") REFERENCES "quest_wednesday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
