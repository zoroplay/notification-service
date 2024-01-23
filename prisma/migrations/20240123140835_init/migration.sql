/*
  Warnings:

  - The `receiver_number` column on the `Sms_Records` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Sms_Records" DROP COLUMN "receiver_number",
ADD COLUMN     "receiver_number" TEXT[];
