-- DropForeignKey
ALTER TABLE "TenantModule" DROP CONSTRAINT "TenantModule_tenantId_fkey";

-- DropIndex
DROP INDEX "Subscription_tenantId_idx";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "TenantModule" ADD CONSTRAINT "TenantModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
