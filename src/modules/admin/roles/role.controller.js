import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { createAuditLog } from "../../../platform/audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";

/**
 * TENANT ADMIN
 * Create role
 */
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const tenantId = req.user.tenantId;
    const createdBy = req.user?.id ?? null;

    logger.info(`[createRole] start - user=${createdBy} tenant=${tenantId} name=${name}`);

    if (!name) {
      logger.warn(`[createRole] validation failed - missing name user=${createdBy} tenant=${tenantId}`);
      return res.status(400).json({ message: "Role name required" });
    }

    const role = await prisma.role.create({
      data: { name, tenantId },
    });

    logger.info(`[createRole] success - created role id=${role.id} name=${role.name} tenant=${tenantId}`);

    // Create audit log (non-blocking for main flow)
    try {
      await createAuditLog({
        actorId: createdBy,
        actorType: "TENANT_USER",
        tenantId,
        action: AUDIT_ACTIONS.ROLE_CREATED,
        entity: "ROLE",
        entityId: role.id,
        meta: { name },
        req,
      });
      logger.info(`[createRole] audit logged for role id=${role.id}`);
    } catch (auditErr) {
      logger.error(`[createRole] failed to create audit log: ${auditErr.message}`, auditErr);
    }

    res.status(201).json({
      success: true,
      role,
    });
  } catch (err) {
    logger.error(`[createRole] error creating role: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to create role",
    });
  }
};

/**
 * TENANT ADMIN
 * Assign permissions to role
 */
export const assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;
    const tenantId = req.user.tenantId;
    const updatedBy = req.user?.id ?? null;

    logger.info(`[assignPermissionsToRole] start - user=${updatedBy} tenant=${tenantId} roleId=${roleId} permissions=${permissions?.length || 0}`);

    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((pid) => ({
        roleId,
        permissionId: pid,
      })),
    });

    logger.info(`[assignPermissionsToRole] success - assigned permissions to role id=${roleId} tenant=${tenantId}`);

    // Create audit log (non-blocking for main flow)
    try {
      await createAuditLog({
        actorId: updatedBy,
        actorType: "TENANT_USER",
        tenantId,
        action: AUDIT_ACTIONS.ROLE_UPDATED,
        entity: "ROLE",
        entityId: roleId,
        meta: { permissions },
        req,
      });
      logger.info(`[assignPermissionsToRole] audit logged for role id=${roleId}`);
    } catch (auditErr) {
      logger.error(`[assignPermissionsToRole] failed to create audit log: ${auditErr.message}`, auditErr);
    }

    res.json({
      success: true,
      message: "Permissions assigned",
    });
  } catch (err) {
    logger.error(`[assignPermissionsToRole] error assigning permissions: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to assign permissions",
    });
  }
};
