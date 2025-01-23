-- CreateEnum
CREATE TYPE "Join_Status" AS ENUM ('EARLY', 'ONTIME', 'LATE', 'MISSED');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "joining_status" "Join_Status" NOT NULL DEFAULT 'MISSED',

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Break" (
    "id" SERIAL NOT NULL,
    "break_status" "Join_Status" NOT NULL DEFAULT 'MISSED',

    CONSTRAINT "Break_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_Delivery" (
    "id" SERIAL NOT NULL,
    "project_status" "Join_Status" NOT NULL DEFAULT 'ONTIME',

    CONSTRAINT "Project_Delivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Break" ADD CONSTRAINT "Break_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Delivery" ADD CONSTRAINT "Project_Delivery_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
