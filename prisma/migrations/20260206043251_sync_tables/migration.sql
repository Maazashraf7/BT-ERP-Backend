-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('SUPER_ADMIN', 'TENANT_USER');

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "tenantId" TEXT,
    "superAdminId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempt" (
    "id" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "tenantId" TEXT,
    "superAdminId" TEXT,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "domain" TEXT,
    "action" TEXT,
    "moduleKey" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_module" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "limit" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_module" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "plan_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "tenantType" TEXT NOT NULL,
    "tenantEmail" TEXT,
    "tenantPhone" TEXT,
    "tenantAddress" TEXT,
    "tenantWebsite" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "themeColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userRole" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "roleId" TEXT,
    "rating" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_tenantId_idx" ON "audit_log"("tenantId");

-- CreateIndex
CREATE INDEX "audit_log_actorType_idx" ON "audit_log"("actorType");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "login_attempt_email_idx" ON "login_attempt"("email");

-- CreateIndex
CREATE INDEX "login_attempt_actorType_idx" ON "login_attempt"("actorType");

-- CreateIndex
CREATE INDEX "login_attempt_tenantId_idx" ON "login_attempt"("tenantId");

-- CreateIndex
CREATE INDEX "login_attempt_createdAt_idx" ON "login_attempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_tenantId_key" ON "role"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_key_key" ON "permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_module_tenantId_moduleId_key" ON "tenant_module"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_module_planId_moduleId_key" ON "plan_module"("planId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_email_key" ON "super_admin"("email");

-- CreateIndex
CREATE INDEX "user_tenantId_idx" ON "user"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_tenantId_key" ON "user"("email", "tenantId");

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempt" ADD CONSTRAINT "login_attempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempt" ADD CONSTRAINT "login_attempt_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempt" ADD CONSTRAINT "login_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_module" ADD CONSTRAINT "tenant_module_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_module" ADD CONSTRAINT "plan_module_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
