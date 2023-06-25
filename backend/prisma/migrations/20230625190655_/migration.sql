-- CreateTable
CREATE TABLE "User" (
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);
