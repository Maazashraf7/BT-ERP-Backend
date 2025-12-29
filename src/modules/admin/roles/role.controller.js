import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";

/**
 * TENANT ADMIN
 * Create role
 */
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const tenantId = req.user.tenantId;
    const actorUserId = req.user.id;

    logger.info(
      `[createRole] start actorUser=${actorUserId} tenant=${tenantId} name=${name}`
    );

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name required",
      });
    }

    const role = await prisma.role.create({
      data: {
        name,
        tenantId,
      },
    });

    await writeAuditLog({
      actorType: "TENANT_USER",
      userId: actorUserId,
      tenantId,
      action: AUDIT_ACTIONS.ROLE_CREATED,
      entity: "ROLE",
      entityId: role.id,
      meta: { name },
      req,
    });

    res.status(201).json({
      success: true,
      role,
    });
  } catch (err) {
    logger.error(`[createRole] error: ${err.message}`, err);

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
    const actorUserId = req.user.id;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array",
      });
    }

    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      prisma.rolePermission.createMany({
        data: permissions.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      }),
    ]);

    await writeAuditLog({
      actorType: "TENANT_USER",
      userId: actorUserId,
      tenantId,
      action: AUDIT_ACTIONS.ROLE_UPDATED,
      entity: "ROLE",
      entityId: roleId,
      meta: { permissions },
      req,
    });

    res.json({
      success: true,
      message: "Permissions assigned successfully",
    });
  } catch (err) {
    logger.error(
      `[assignPermissionsToRole] error: ${err.message}`,
      err
    );

    res.status(500).json({
      success: false,
      message: "Failed to assign permissions",
    });
  }
};


/**
 * TENANT ADMIN
 * Get all roles with permissions
 */
export const getRoles = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const roles = await prisma.role.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                key: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((rp) => ({
          id: rp.permission.id,
          key: rp.permission.key,
        })),
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};


/**
 * TENANT ADMIN
 * Get role by ID
 */
export const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    const tenantId = req.user.tenantId;

    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((rp) => rp.permission),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
    });
  }
};
