/*
  Warnings:

  - A unique constraint covering the columns `[user_id,endpoint,client_id]` on the table `push_subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `notification_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "push_subscriptions_user_id_endpoint_key";

-- AlterTable
ALTER TABLE "notification_messages" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_client_id_key" ON "push_subscriptions"("user_id", "endpoint", "client_id");
