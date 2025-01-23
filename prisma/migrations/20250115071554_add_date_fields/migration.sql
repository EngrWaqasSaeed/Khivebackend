/*
  Warnings:

  - Added the required column `date` to the `Break` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Break" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
