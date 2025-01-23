/*
  Warnings:

  - You are about to drop the column `userId` on the `Attendence` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendence" DROP CONSTRAINT "Attendence_userId_fkey";

-- AlterTable
ALTER TABLE "Attendence" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Attendence" ADD CONSTRAINT "Attendence_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
