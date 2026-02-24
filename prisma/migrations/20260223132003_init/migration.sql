-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "chat_type" AS ENUM ('DIRECT', 'GROUP', 'BROADCAST');

-- CreateEnum
CREATE TYPE "platform" AS ENUM ('WEB', 'MOBILE', 'ANDROID', 'IOS', 'RETAIL');

-- CreateTable
CREATE TABLE "notification_messages" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_messages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" UUID NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "chat_type" "chat_type" NOT NULL DEFAULT 'DIRECT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "chat_id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "left_at" TIMESTAMPTZ(6),
    "unread_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "message_status" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "duration" INTEGER,
    "file_url" TEXT,
    "file_size" INTEGER,
    "file_type" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "message_reads" (
    "message_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("message_id","user_id")
);

-- CreateTable
CREATE TABLE "unread_message_counts" (
    "user_id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "last_read_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unread_message_counts_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "subscription_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT,
    "auth" TEXT,
    "platform" "platform" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateIndex
CREATE INDEX "chat_participants_user_id_idx" ON "chat_participants"("user_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_idx" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "message_reads_user_id_idx" ON "message_reads"("user_id");

-- CreateIndex
CREATE INDEX "unread_message_counts_user_id_idx" ON "unread_message_counts"("user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unread_message_counts" ADD CONSTRAINT "unread_message_counts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
