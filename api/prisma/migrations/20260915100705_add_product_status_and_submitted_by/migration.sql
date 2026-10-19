-- AlterTable
ALTER TABLE "product" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN     "submittedBy" TEXT;
