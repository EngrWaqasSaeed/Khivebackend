/*
  Warnings:

  - You are about to drop the column `cnic` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contact_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_cnic_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cnic",
ADD COLUMN     "contact_number" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_number_key" ON "User"("contact_number");
