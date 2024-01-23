/*
  Warnings:

  - The primary key for the `sms_provider_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `setting_id` on the `sms_provider_settings` table. All the data in the column will be lost.
  - Changed the type of `client_id` on the `sms_provider_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "sms_provider_settings" DROP CONSTRAINT "sms_provider_settings_pkey",
DROP COLUMN "setting_id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "client_id",
ADD COLUMN     "client_id" INTEGER NOT NULL,
ADD CONSTRAINT "sms_provider_settings_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "SMS_Records" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_number" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMS_Records_pkey" PRIMARY KEY ("id")
);
