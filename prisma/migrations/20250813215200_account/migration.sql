/*
  Warnings:

  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_provider_providerAccountId_key" ON "user_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
