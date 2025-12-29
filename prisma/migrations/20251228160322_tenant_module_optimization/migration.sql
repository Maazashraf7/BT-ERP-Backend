-- CreateEnum
CREATE TYPE "ModuleSource" AS ENUM ('PLAN', 'ADDON', 'TRIAL', 'MANUAL');

-- AlterTable
ALTER TABLE "TenantModule" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "limit" INTEGER,
ADD COLUMN     "source" "ModuleSource" NOT NULL DEFAULT 'PLAN';
