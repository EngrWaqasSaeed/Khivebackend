/*
  Warnings:

  - Added the required column `date` to the `Project_Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project_Delivery" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
