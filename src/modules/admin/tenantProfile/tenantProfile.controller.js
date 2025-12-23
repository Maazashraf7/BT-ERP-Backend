import prisma from "../../../core/config/db.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";

export const upsertTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
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
    await createAuditLog({
      actorType: "TENANT_USER",
      tenantId,
      action: AUDIT_ACTIONS.TENANT_PROFILE_UPDATED,
      entity: "TENANT_PROFILE",
      entityId: profile.id,
      meta: { updatedFields: Object.keys(req.body) },
      req,
    });

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("TENANT PROFILE UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tenant profile",
    });
  }
};
