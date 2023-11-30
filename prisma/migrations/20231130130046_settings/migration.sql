-- CreateTable
CREATE TABLE "sms_provider_settings" (
    "settings_id" TEXT NOT NULL,
    "enable" BOOLEAN NOT NULL,
    "display_name" TEXT NOT NULL,
    "gateway_name" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_provider_settings_pkey" PRIMARY KEY ("settings_id")
);
