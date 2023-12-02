/*
  Warnings:

  - The primary key for the `sms_provider_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `enable` on the `sms_provider_settings` table. All the data in the column will be lost.
  - You are about to drop the column `settings_id` on the `sms_provider_settings` table. All the data in the column will be lost.
  - Added the required column `client_id` to the `sms_provider_settings` table without a default value. This is not possible if the table is not empty.
  - The required column `setting_id` was added to the `sms_provider_settings` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "sms_provider_settings" DROP CONSTRAINT "sms_provider_settings_pkey",
DROP COLUMN "enable",
DROP COLUMN "settings_id",
ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "setting_id" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "sms_provider_settings_pkey" PRIMARY KEY ("setting_id");
