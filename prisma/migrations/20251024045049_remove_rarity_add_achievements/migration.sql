/*
  Warnings:

  - You are about to drop the column `rarity` on the `achievements` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "achievements_rarity_idx";

-- AlterTable
ALTER TABLE "achievements" DROP COLUMN "rarity";
