import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import { clearRoleCache } from "../../../core/cache/permission.cache.js";

// 🏆 AUTHORITY LEVELS

/**
 * Get internal level for the requester
 */
const getRequesterLevel = async (user) => {
  try {
    if (user.type === "SUPER_ADMIN") {
      const admin = await prisma.superAdmin.findUnique({
        where: { id: user.id },
        select: { power: true }
      });
      return admin?.power ? parseInt(admin.power) : 1000;
    }

    if (user.type === "TENANT") {
      const lp = await prisma.levelPower.findFirst({
        where: { tenantId: user.id, role_name: "TENANT_ADMIN" },
        select: { power: true }
      });
      return lp?.power ? parseInt(lp.power) : 100;
    }

    // For regular users with assigned roles
    if (user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });
      if (dbUser && dbUser.role) {
        return dbUser.role.level || 0;
      }
    }
  } catch (error) {
    logger.error("Error in getRequesterLevel:", error);
  }

  return 0;
};

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

    const { level } = req.body;
    const requestedLevel = level !== undefined ? parseInt(level) : 10;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name required",
      });
    }

    // 🔒 HIERARCHY CHECK
    const myLevel = await getRequesterLevel(req.user);

    if (requestedLevel >= myLevel) {
      return res.status(403).json({
        success: false,
        message: `Not authorized: You can only create roles with a level lower than your own (Your level: ${myLevel}, Requested level: ${requestedLevel}).`,
      });
    }

    // ⚡ LevelPower Check and Sync
    const role = await prisma.$transaction(async (tx) => {
      // Check if this role name already exists in levelPower for this tenant
      const existingLP = await tx.levelPower.findFirst({
        where: { tenantId, role_name: name }
      });

      if (existingLP) {
        const lpPower = parseInt(existingLP.power);
        // If it exists, enforce that the new role must have the SAME power level
        if (requestedLevel !== lpPower) {
          throw new Error(`This role name is already registered with power ${lpPower}. Please assign exactly this power or use a different name.`);
        }
      } else {
        // If it doesn't exist, Create it in levelPower table
        const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { tenantName: true } });
        await tx.levelPower.create({
          data: {
            tenantId,
            tenantName: tenant?.tenantName || "Unknown",
            role_name: name,
            power: requestedLevel.toString(),
          }
        });
      }

      // Create the Role
      return await tx.role.create({
        data: {
          name,
          level: requestedLevel,
          tenantId,
        },
      });
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
        level: role.level,
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
        level: role.level,
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

    // 🔒 HIERARCHY CHECK
    const myLevel = await getRequesterLevel(req.user);
    const newLevel = req.body.level !== undefined ? parseInt(req.body.level) : role.level;

    // Check if user can manage THIS role
    if (myLevel <= role.level && req.user.type !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized: You cannot update a role of equal or higher authority.",
      });
    }

    // Check if user can set the NEW level
    if (newLevel >= myLevel && req.user.type !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: `Not authorized: You cannot promote a role to your own level or higher.`,
      });
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name || role.name,
        level: newLevel
      },
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

    // 🔒 HIERARCHY CHECK
    const myLevel = await getRequesterLevel(req.user);
    if (myLevel <= role.level && req.user.type !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized: You cannot delete a role of equal or higher authority.",
      });
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
