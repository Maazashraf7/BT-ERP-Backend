-- CreateTable
CREATE TABLE "UIWidget" (
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,

    CONSTRAINT "UIWidget_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "TenantWidget" (
    "tenantId" TEXT NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "DashboardLayout" (
    "tenantId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "uiVersion" TEXT NOT NULL,
    "layoutKey" TEXT NOT NULL,
    "breakpoint" TEXT NOT NULL,
    "layout" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantWidget_tenantId_widgetKey_key" ON "TenantWidget"("tenantId", "widgetKey");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardLayout_tenantId_roleId_uiVersion_layoutKey_breakpo_key" ON "DashboardLayout"("tenantId", "roleId", "uiVersion", "layoutKey", "breakpoint");
