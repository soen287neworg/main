/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED');

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SystemPermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT,
    "userId" TEXT,
    "permission" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SystemPermission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SystemPermission" ADD CONSTRAINT "SystemPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemPermission" ADD CONSTRAINT "SystemPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
