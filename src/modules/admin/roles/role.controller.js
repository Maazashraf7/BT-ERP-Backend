import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import { clearRoleCache } from "../../../core/cache/permission.cache.js";

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

/**
 * TENANT ADMIN
 * Update Role
 */
export const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name } = req.body;
    const tenantId = req.user.tenantId;
    const actorUserId = req.user.id; // Corrected variable name

    if (!name) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    const role = await prisma.role.findFirst({
      where: { id: roleId, tenantId },
    });

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: { name },
    });

    await writeAuditLog({
      actorType: "TENANT_USER",
      userId: actorUserId,
      tenantId,
      action: AUDIT_ACTIONS.ROLE_UPDATED,
      entity: "ROLE",
      entityId: roleId,
      meta: { name },
      req,
    });

    res.json({ success: true, role: updatedRole });
  } catch (err) {
    logger.error(`[updateRole] error: ${err.message}`, err);
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
};

/**
 * TENANT ADMIN
 * Delete Role
 */
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const tenantId = req.user.tenantId;
    const actorUserId = req.user.id;

    const role = await prisma.role.findFirst({
      where: { id: roleId, tenantId },
    });

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    // Clear cache incase this role had permissions
    clearRoleCache(roleId);

    await writeAuditLog({
      actorType: "TENANT_USER",
      userId: actorUserId,
      tenantId,
      action: AUDIT_ACTIONS.ROLE_DELETED,
      entity: "ROLE",
      entityId: roleId,
      req,
    });

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    logger.error(`[deleteRole] error: ${err.message}`, err);
    res.status(500).json({ success: false, message: "Failed to delete role" });
  }
};
