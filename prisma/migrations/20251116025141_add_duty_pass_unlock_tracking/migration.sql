-- CreateTable
CREATE TABLE "duty_pass_unlocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questDay" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duty_pass_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duty_pass_unlocks_userId_questDay_idx" ON "duty_pass_unlocks"("userId", "questDay");

-- CreateIndex
CREATE INDEX "duty_pass_unlocks_userId_unlockedAt_idx" ON "duty_pass_unlocks"("userId", "unlockedAt");

-- AddForeignKey
ALTER TABLE "duty_pass_unlocks" ADD CONSTRAINT "duty_pass_unlocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
