/*
  Warnings:

  - The primary key for the `SubscriptionCreated` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `SubscriptionCreated` table. All the data in the column will be lost.
  - The required column `subscriptionCreated_id` was added to the `SubscriptionCreated` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "SubscriptionCreated" DROP CONSTRAINT "SubscriptionCreated_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "subscriptionCreated_id" TEXT NOT NULL,
ADD CONSTRAINT "SubscriptionCreated_pkey" PRIMARY KEY ("subscriptionCreated_id");
