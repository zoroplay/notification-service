/*
  Warnings:

  - You are about to drop the column `receiver_number` on the `Sms_Records` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `Sms_Records` table. All the data in the column will be lost.
  - You are about to drop the column `api_key` on the `sms_provider_settings` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `sms_provider_settings` table. All the data in the column will be lost.
  - You are about to drop the column `gateway_name` on the `sms_provider_settings` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `sms_provider_settings` table. All the data in the column will be lost.
  - Added the required column `receiverNumber` to the `Sms_Records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderID` to the `Sms_Records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiKey` to the `sms_provider_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `sms_provider_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gatewayName` to the `sms_provider_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderID` to the `sms_provider_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sms_Records" DROP COLUMN "receiver_number",
DROP COLUMN "sender_id",
ADD COLUMN     "receiverNumber" TEXT NOT NULL,
ADD COLUMN     "senderID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sms_provider_settings" DROP COLUMN "api_key",
DROP COLUMN "display_name",
DROP COLUMN "gateway_name",
DROP COLUMN "sender_id",
ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "gatewayName" TEXT NOT NULL,
ADD COLUMN     "senderID" TEXT NOT NULL;
