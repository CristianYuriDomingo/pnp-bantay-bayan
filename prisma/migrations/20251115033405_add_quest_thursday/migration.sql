/*
  Warnings:

  - You are about to drop the column `description` on the `quest_tuesday` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quest_tuesday" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "quest_thursday" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Confiscate or Allow',
    "lives" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_thursday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_thursday_items" (
    "id" TEXT NOT NULL,
    "questThursdayId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemImage" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quest_thursday_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_thursday_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questThursdayId" TEXT NOT NULL,
    "currentItem" INTEGER NOT NULL DEFAULT 1,
    "completedItems" JSONB NOT NULL DEFAULT '[]',
    "answeredItems" JSONB NOT NULL DEFAULT '[]',
    "livesRemaining" INTEGER NOT NULL DEFAULT 3,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isFailed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_thursday_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_thursday_items_questThursdayId_idx" ON "quest_thursday_items"("questThursdayId");

-- CreateIndex
CREATE INDEX "quest_thursday_items_orderIndex_idx" ON "quest_thursday_items"("orderIndex");

-- CreateIndex
CREATE INDEX "quest_thursday_progress_userId_idx" ON "quest_thursday_progress"("userId");

-- CreateIndex
CREATE INDEX "quest_thursday_progress_questThursdayId_idx" ON "quest_thursday_progress"("questThursdayId");

-- CreateIndex
CREATE INDEX "quest_thursday_progress_isCompleted_idx" ON "quest_thursday_progress"("isCompleted");

-- CreateIndex
CREATE INDEX "quest_thursday_progress_isFailed_idx" ON "quest_thursday_progress"("isFailed");

-- CreateIndex
CREATE UNIQUE INDEX "quest_thursday_progress_userId_questThursdayId_key" ON "quest_thursday_progress"("userId", "questThursdayId");

-- AddForeignKey
ALTER TABLE "quest_thursday_items" ADD CONSTRAINT "quest_thursday_items_questThursdayId_fkey" FOREIGN KEY ("questThursdayId") REFERENCES "quest_thursday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_thursday_progress" ADD CONSTRAINT "quest_thursday_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_thursday_progress" ADD CONSTRAINT "quest_thursday_progress_questThursdayId_fkey" FOREIGN KEY ("questThursdayId") REFERENCES "quest_thursday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
