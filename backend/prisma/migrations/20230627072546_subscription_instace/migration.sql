-- CreateTable
CREATE TABLE "SubscriptionInstanceCreated" (
    "SubscriptionInstanceCreated_id" TEXT NOT NULL,
    "caller" TEXT NOT NULL,
    "subscriptionInstanceId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "nextPayment" JSONB NOT NULL,
    "status" JSONB NOT NULL,
    "discount" JSONB NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "SubscriptionInstanceCreated_pkey" PRIMARY KEY ("SubscriptionInstanceCreated_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionInstanceCreated_subscriptionInstanceId_key" ON "SubscriptionInstanceCreated"("subscriptionInstanceId");
