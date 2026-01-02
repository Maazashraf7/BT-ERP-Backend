-- CreateIndex
CREATE INDEX "UIWidget_permission_idx" ON "UIWidget"("permission");

-- CreateIndex
CREATE INDEX "UIWidget_moduleKey_idx" ON "UIWidget"("moduleKey");

-- AddForeignKey
ALTER TABLE "TenantWidget" ADD CONSTRAINT "TenantWidget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
