import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import { clearRoleCache } from "../../../core/cache/permission.cache.js";

/**
 * TENANT ADMIN
 * List permissions grouped for UI
 */
export const listGroupedPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { key: "asc" },
    });

    const grouped = permissions.reduce((acc, p) => {
      const [group, ...rest] = p.key.split("_");
      const action = rest.join("_");

      if (!acc[group]) {
        acc[group] = {
          label: group,
          permissions: [],
        };
      }

      acc[group].permissions.push({
        id: p.id,
        key: p.key,
        action,
      });

      return acc;
    }, {});

    res.json({
      success: true,
      groups: Object.values(grouped),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};

/**
 * SUPER ADMIN
 * Create Permission
 */
export const createPermission = async (req, res) => {
  try {
    const { key, name, domain, action, module } = req.body;
    const superAdminId = req.user.id;

    if (!key || !name) {
      return res.status(400).json({ success: false, message: "Key and Name are required" });
    }

    const existing = await prisma.permission.findUnique({ where: { key } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Permission key already exists" });
    }

    const permission = await prisma.permission.create({
      data: { key, name, domain, action, module }
    });

    // Optional Audit
    // await writeAuditLog(...)

    res.status(201).json({ success: true, permission });
  } catch (error) {
    console.error("Create Permission Error:", error);
    res.status(500).json({ success: false, message: "Failed to create permission" });
  }
};

/**
 * SUPER ADMIN
 * Update Permission
 */
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, name, domain, action, module } = req.body;

    const permission = await prisma.permission.update({
      where: { id },
      data: { key, name, domain, action, module }
    });

    res.json({ success: true, message: "Permission updated", permission });
  } catch (error) {
    console.error("Update Permission Error:", error);
    res.status(500).json({ success: false, message: "Failed to update permission" });
  }
};

/**
 * SUPER ADMIN
 * Delete Permission
 */
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.permission.delete({
      where: { id }
    });

    res.json({ success: true, message: "Permission deleted" });
  } catch (error) {
    console.error("Delete Permission Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete permission" });
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

    // 🔥 Invalidate Cache
    clearRoleCache(roleId);

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
