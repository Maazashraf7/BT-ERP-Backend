-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "isCommon" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ModuleTenantType" (
    "moduleId" TEXT NOT NULL,
    "tenantType" "TenantType" NOT NULL,

    CONSTRAINT "ModuleTenantType_pkey" PRIMARY KEY ("moduleId","tenantType")
);

-- AddForeignKey
ALTER TABLE "ModuleTenantType" ADD CONSTRAINT "ModuleTenantType_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
