/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "SubscriptionCreated" (
    "user_id" TEXT NOT NULL,
    "caller" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "vaultAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "recurringAmount" INTEGER NOT NULL,
    "initialAmmount" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "SubscriptionCreated_pkey" PRIMARY KEY ("user_id")
);
