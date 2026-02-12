/*
  Warnings:

  - You are about to drop the column `isMain` on the `Avatar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "isMain",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
