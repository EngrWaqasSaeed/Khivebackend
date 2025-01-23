/*
  Warnings:

  - Added the required column `userId` to the `Attendence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendence" DROP CONSTRAINT "Attendence_id_fkey";

-- AlterTable
ALTER TABLE "Attendence" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendence" ADD CONSTRAINT "Attendence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
