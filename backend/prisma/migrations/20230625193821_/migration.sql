/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `SubscriptionCreated` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCreated_subscriptionId_key" ON "SubscriptionCreated"("subscriptionId");
