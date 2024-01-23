/*
  Warnings:

  - You are about to drop the `SMS_Records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SMS_Records";

-- CreateTable
CREATE TABLE "Sms_Records" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_number" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sms_Records_pkey" PRIMARY KEY ("id")
);
