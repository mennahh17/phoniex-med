/*
  Warnings:

  - Made the column `trackInventory` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product" ALTER COLUMN "trackInventory" SET NOT NULL,
ALTER COLUMN "trackInventory" SET DEFAULT false;
