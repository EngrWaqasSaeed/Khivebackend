/*
  Warnings:

  - The `workStatus` column on the `Attendence` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONSITE', 'WORKFORMHOME', 'HYBRID');

-- AlterTable
ALTER TABLE "Attendence" DROP COLUMN "workStatus",
ADD COLUMN     "workStatus" "Status" NOT NULL DEFAULT 'ONSITE';
