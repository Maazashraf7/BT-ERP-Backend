import prisma from "../../../core/config/db.js";
import { uploadImage } from "./upload.service.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";

/**
 * 🏫 TENANT ADMIN
 * Upload branding assets
 */
export const uploadBranding = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const file = req.file;
    const { type } = req.body; // logo | favicon

    if (!file || !type) {
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

    // 🔍 Audit
    await createAuditLog({
      actorType: "TENANT_USER",
      tenantId,
      action: AUDIT_ACTIONS.TENANT_BRANDING_UPDATED,
      entity: "TENANT_PROFILE",
      entityId: profile.id,
      meta: { type, imageUrl },
      req,
    });

    res.json({
      success: true,
      imageUrl,
    });
  } catch (err) {
    console.error("BRANDING UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to upload branding",
    });
  }
};
