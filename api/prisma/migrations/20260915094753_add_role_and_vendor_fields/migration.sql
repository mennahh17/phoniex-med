-- AlterTable
ALTER TABLE "user" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'customer';
