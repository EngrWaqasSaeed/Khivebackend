/*
  Warnings:

  - Made the column `workStatus` on table `Attendence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendence" ALTER COLUMN "workStatus" SET NOT NULL;
