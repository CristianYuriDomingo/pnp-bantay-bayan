-- CreateTable
CREATE TABLE "quest_tuesday" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Free or Jail Quiz',
    "description" TEXT,
    "lives" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_tuesday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_tuesday_questions" (
    "id" TEXT NOT NULL,
    "questTuesdayId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" BOOLEAN NOT NULL,
    "explanation" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_tuesday_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_tuesday_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questTuesdayId" TEXT NOT NULL,
    "currentQuestion" INTEGER NOT NULL DEFAULT 1,
    "completedQuestions" JSONB NOT NULL DEFAULT '[]',
    "answeredQuestions" JSONB NOT NULL DEFAULT '[]',
    "livesRemaining" INTEGER NOT NULL DEFAULT 3,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isFailed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_tuesday_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_tuesday_questions_questTuesdayId_idx" ON "quest_tuesday_questions"("questTuesdayId");

-- CreateIndex
CREATE INDEX "quest_tuesday_questions_questionNumber_idx" ON "quest_tuesday_questions"("questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quest_tuesday_questions_questTuesdayId_questionNumber_key" ON "quest_tuesday_questions"("questTuesdayId", "questionNumber");

-- CreateIndex
CREATE INDEX "quest_tuesday_progress_userId_idx" ON "quest_tuesday_progress"("userId");

-- CreateIndex
CREATE INDEX "quest_tuesday_progress_questTuesdayId_idx" ON "quest_tuesday_progress"("questTuesdayId");

-- CreateIndex
CREATE INDEX "quest_tuesday_progress_isCompleted_idx" ON "quest_tuesday_progress"("isCompleted");

-- CreateIndex
CREATE INDEX "quest_tuesday_progress_isFailed_idx" ON "quest_tuesday_progress"("isFailed");

-- CreateIndex
CREATE UNIQUE INDEX "quest_tuesday_progress_userId_questTuesdayId_key" ON "quest_tuesday_progress"("userId", "questTuesdayId");

-- AddForeignKey
ALTER TABLE "quest_tuesday_questions" ADD CONSTRAINT "quest_tuesday_questions_questTuesdayId_fkey" FOREIGN KEY ("questTuesdayId") REFERENCES "quest_tuesday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tuesday_progress" ADD CONSTRAINT "quest_tuesday_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tuesday_progress" ADD CONSTRAINT "quest_tuesday_progress_questTuesdayId_fkey" FOREIGN KEY ("questTuesdayId") REFERENCES "quest_tuesday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
