import prisma from "../../../core/config/db.js";
import { uploadImage } from "./upload.service.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import logger from "../../../core/utils/logger.js";

/**
 * 🏫 TENANT ADMIN
 * Upload branding assets
 */
export const uploadBranding = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user?.id ?? null;
    const file = req.file;
    const { type } = req.body; // logo | favicon

    logger.info(`[uploadBranding] start - user=${userId} tenant=${tenantId} type=${type}`);

    if (!file || !type) {
      logger.warn(`[uploadBranding] validation failed - missing file or type user=${userId} tenant=${tenantId}`);
      return res.status(400).json({
        success: false,
        message: "File and type are required",
      });
    }

    const folder = `tenants/${tenantId}/branding`;
    const imageUrl = await uploadImage(file, folder);

    const updateData =
      type === "logo"
        ? { logoUrl: imageUrl }
        : { faviconUrl: imageUrl };

    const profile = await prisma.tenantProfile.upsert({
      where: { tenantId },
      update: updateData,
      create: { tenantId, ...updateData },
    });

    logger.info(`[uploadBranding] success - updated ${type} for tenant=${tenantId}`);

    // 🔍 Audit
    try {
      await createAuditLog({
        actorType: "TENANT_USER",
        tenantId,
        action: AUDIT_ACTIONS.TENANT_BRANDING_UPDATED,
        entity: "TENANT_PROFILE",
        entityId: profile.id,
        meta: { type, imageUrl },
        req,
      });
      logger.info(`[uploadBranding] audit logged for profile id=${profile.id}`);
    } catch (auditErr) {
      logger.error(`[uploadBranding] failed to create audit log: ${auditErr.message}`, auditErr);
    }

    res.json({
      success: true,
      imageUrl,
    });
  } catch (err) {
    logger.error(`[uploadBranding] error: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to upload branding",
    });
  }
};
