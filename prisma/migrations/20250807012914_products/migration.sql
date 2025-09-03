-- AlterTable
ALTER TABLE "products" ADD COLUMN     "averageRating" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;
