/*
  Warnings:

  - You are about to drop the column `status` on the `SubscriptionInstanceCreated` table. All the data in the column will be lost.
  - Added the required column `active` to the `SubscriptionInstanceCreated` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionInstanceCreated" DROP COLUMN "status",
ADD COLUMN     "active" BOOLEAN NOT NULL;
