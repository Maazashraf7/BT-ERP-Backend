import prisma from "../../../core/config/db.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import logger from "../../../core/utils/logger.js";

export const upsertTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user?.id ?? null;
    logger.info(`[upsertTenantProfile] start - user=${userId} tenant=${tenantId}`);
    const {
      logoUrl,
      faviconUrl,
      themeColor,
      email,
      phone,
      address,
      website,
    } = req.body;

    // Basic validation (extend later)
    if (email && !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const profile = await prisma.tenantProfile.upsert({
      where: { tenantId },
      update: {
        logoUrl,
        faviconUrl,
        themeColor,
        email,
        phone,
        address,
        website,
      },
      create: {
        tenantId,
        logoUrl,
        faviconUrl,
        themeColor,
        email,
        phone,
        address,
        website,
      },
    });

    // 🔍 Audit
    try {
      await createAuditLog({
        actorType: "TENANT_USER",
        tenantId,
        action: AUDIT_ACTIONS.TENANT_PROFILE_UPDATED,
        entity: "TENANT_PROFILE",
        entityId: profile.id,
        meta: { updatedFields: Object.keys(req.body) },
        req,
      });
      logger.info(`[upsertTenantProfile] audit created for profile id=${profile.id}`);
    } catch (auditErr) {
      logger.error(`[upsertTenantProfile] audit creation failed: ${auditErr.message}`, auditErr);
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    logger.error(`TENANT PROFILE UPDATE ERROR: ${error.message}`, error);
    res.status(500).json({ success: false, message: "Failed to update tenant profile" });
  }
};

/**
 * TENANT ADMIN
 * Get Tenant Profile
 */
export const getTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const profile = await prisma.tenantProfile.findUnique({
      where: { tenantId },
    });

    // Profile may not exist yet (first-time setup)
    res.json({
      success: true,
      profile: profile ?? null,
    });
  } catch (error) {
    logger.error(
      `[getTenantProfile] error: ${error.message}`,
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant profile",
    });
  }
};

