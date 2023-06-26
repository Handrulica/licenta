/*
  Warnings:

  - Changed the type of `recurringAmount` on the `SubscriptionCreated` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `period` on the `SubscriptionCreated` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `initialAmount` on the `SubscriptionCreated` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SubscriptionCreated" DROP COLUMN "recurringAmount",
ADD COLUMN     "recurringAmount" JSONB NOT NULL,
DROP COLUMN "period",
ADD COLUMN     "period" JSONB NOT NULL,
DROP COLUMN "initialAmount",
ADD COLUMN     "initialAmount" JSONB NOT NULL;
