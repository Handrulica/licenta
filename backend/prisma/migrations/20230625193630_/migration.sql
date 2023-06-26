/*
  Warnings:

  - You are about to drop the column `initialAmmount` on the `SubscriptionCreated` table. All the data in the column will be lost.
  - Added the required column `initialAmount` to the `SubscriptionCreated` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionCreated" DROP COLUMN "initialAmmount",
ADD COLUMN     "initialAmount" INTEGER NOT NULL;
