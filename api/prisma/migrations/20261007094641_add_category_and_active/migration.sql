-- AlterTable
ALTER TABLE "product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
