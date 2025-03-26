-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoggedIn" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;
