/*
  Warnings:

  - You are about to drop the column `userId` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- DropIndex
DROP INDEX "Reservation_userId_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "userId";
