-- CreateTable
CREATE TABLE IF NOT EXISTS "email_provider_settings" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "gatewayName" TEXT NOT NULL,
    "senderID" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_provider_settings_pkey" PRIMARY KEY ("id")
);
