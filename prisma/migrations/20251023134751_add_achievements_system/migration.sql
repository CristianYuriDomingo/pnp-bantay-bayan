-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'Common',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "criteriaType" TEXT NOT NULL,
    "criteriaValue" TEXT NOT NULL,
    "criteriaData" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationSeen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "achievements_type_idx" ON "achievements"("type");

-- CreateIndex
CREATE INDEX "achievements_rarity_idx" ON "achievements"("rarity");

-- CreateIndex
CREATE INDEX "achievements_isActive_idx" ON "achievements"("isActive");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_achievements_earnedAt_idx" ON "user_achievements"("earnedAt");

-- CreateIndex
CREATE INDEX "user_achievements_notificationSeen_idx" ON "user_achievements"("notificationSeen");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
