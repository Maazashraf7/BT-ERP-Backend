/*
  SAFE MIGRATION
  - Backfills data before constraints
  - Preserves audit history
  - Avoids NOT NULL failures
*/

-- ======================================
-- 1️⃣ USER TABLE FIXES (SAFE)
-- ======================================

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Backfill updatedAt
UPDATE "User"
SET "updatedAt" = NOW()
WHERE "updatedAt" IS NULL;

-- Fix NULL tenantId users (CHOOSE ONE OPTION)

-- OPTION A: Assign to a valid tenant (RECOMMENDED)
-- UPDATE "User"
-- SET "tenantId" = '<TENANT_UUID>'
-- WHERE "tenantId" IS NULL;

-- OPTION B: Delete invalid users
DELETE FROM "User"
WHERE "tenantId" IS NULL;

-- Enforce constraints AFTER cleanup
ALTER TABLE "User"
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "tenantId" SET NOT NULL;

-- ======================================
-- 2️⃣ SUPER ADMIN TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS "SuperAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SuperAdmin_email_key"
ON "SuperAdmin"("email");

-- ======================================
-- 3️⃣ AUDIT LOG SAFE MIGRATION
-- ======================================

-- Add new columns first
ALTER TABLE "AuditLog"
ADD COLUMN IF NOT EXISTS "superAdminId" TEXT,
ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Backfill from old actorId
UPDATE "AuditLog"
SET "userId" = "actorId"
WHERE "actorType" = 'TENANT_USER' AND "actorId" IS NOT NULL;

UPDATE "AuditLog"
SET "superAdminId" = "actorId"
WHERE "actorType" = 'SUPER_ADMIN' AND "actorId" IS NOT NULL;

-- Drop old column AFTER backfill
ALTER TABLE "AuditLog"
DROP COLUMN IF EXISTS "actorId";

-- ======================================
-- 4️⃣ LOGIN ATTEMPT TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS "LoginAttempt" (
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
    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- ======================================
-- 5️⃣ ROLE DUPLICATE SAFETY
-- ======================================

-- Remove duplicate roles BEFORE unique constraint
DELETE FROM "Role" r1
USING "Role" r2
WHERE r1.id > r2.id
AND r1.name = r2.name
AND r1."tenantId" = r2."tenantId";

CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_tenantId_key"
ON "Role"("name", "tenantId");

-- ======================================
-- 6️⃣ INDEXES
-- ======================================

CREATE INDEX IF NOT EXISTS "LoginAttempt_email_idx" ON "LoginAttempt"("email");
CREATE INDEX IF NOT EXISTS "LoginAttempt_actorType_idx" ON "LoginAttempt"("actorType");
CREATE INDEX IF NOT EXISTS "LoginAttempt_tenantId_idx" ON "LoginAttempt"("tenantId");
CREATE INDEX IF NOT EXISTS "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_actorType_idx" ON "AuditLog"("actorType");
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");

-- ======================================
-- 7️⃣ FOREIGN KEYS (FINAL)
-- ======================================

-- Drop FK if already exists (shadow DB safety)
ALTER TABLE "User"
DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";

-- Re-add FK
ALTER TABLE "User"
ADD CONSTRAINT "User_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_superAdminId_fkey"
FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LoginAttempt"
ADD CONSTRAINT "LoginAttempt_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LoginAttempt"
ADD CONSTRAINT "LoginAttempt_superAdminId_fkey"
FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LoginAttempt"
ADD CONSTRAINT "LoginAttempt_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
