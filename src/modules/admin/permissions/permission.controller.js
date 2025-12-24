import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";

/**
 * TENANT ADMIN
 * List all permissions
 */
export const listPermissions = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user?.id ?? null;

    logger.info(`[listPermissions] start - user=${userId} tenant=${tenantId}`);

    const permissions = await prisma.permission.findMany({
      orderBy: { key: "asc" },
    });

    logger.info(`[listPermissions] success - fetched ${permissions.length} permissions for tenant=${tenantId}`);

    res.json({
      success: true,
      permissions,
    });
  } catch (err) {
    logger.error(`[listPermissions] error fetching permissions: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};
