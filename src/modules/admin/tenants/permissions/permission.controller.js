import prisma from "../../../../core/config/db.js";
import logger from "../../../../core/utils/logger.js";
import { writeAuditLog } from "../../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../../platform/audit/audit.constants.js";
import { clearRoleCache } from "../../../../core/cache/permission.cache.js";

/**
 * TENANT ADMIN
 * List permissions grouped for UI
 */
export const listTenantGroupedPermissions = async (req, res) => {
  try {
    const permissions = await prisma.tenantPermission.findMany({
      include: { domain: true },
      orderBy: { key: "asc" },
    });

    const grouped = permissions.reduce((acc, p) => {
      const groupName = p.domain?.name || "Uncategorized";

      if (!acc[groupName]) {
        acc[groupName] = {
          label: groupName,
          domainId: p.domainId,
          permissions: [],
        };
      }

      acc[groupName].permissions.push({
        id: p.id,
        key: p.key,
        name: p.name,
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
 * Create Tenant Permission
 */
export const createTenantPermission = async (req, res) => {
  try {
    const { key, name, domainId } = req.body;

    if (!key || !name) {
      return res.status(400).json({ success: false, message: "Key and Name are required" });
    }

    const existing = await prisma.tenantPermission.findUnique({ where: { key } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Permission key already exists" });
    }

    const permission = await prisma.tenantPermission.create({
      data: { key, name, domainId }
    });

    res.status(201).json({ success: true, permission });
  } catch (error) {
    console.error("Create Permission Error:", error);
    res.status(500).json({ success: false, message: "Failed to create permission" });
  }
};

/**
 * SUPER ADMIN
 * Update Tenant Permission
 */
export const updateTenantPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, name, domainId } = req.body;

    const existing = await prisma.tenantPermission.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Permission not found" });
    }

    const permission = await prisma.tenantPermission.update({
      where: { id },
      data: { key, name, domainId }
    });

    res.json({ success: true, message: "Permission updated", permission });
  } catch (error) {
    console.error("Update Permission Error:", error);
    res.status(500).json({ success: false, message: "Failed to update permission" });
  }
};

/**
 * SUPER ADMIN
 * Delete Tenant Permission
 */
export const deleteTenantPermission = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tenantPermission.delete({
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
 * Assign permissions to tenant role
 */
export const assignPermissionsToTenantRole = async (req, res) => {
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

    const role = await prisma.tenantRole.findFirst({
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
      prisma.tenantRolePermission.deleteMany({
        where: { roleId },
      }),
      prisma.tenantRolePermission.createMany({
        data: permissions.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      }),
    ]);

    // 🔥 Invalidate Cache
    clearRoleCache(roleId);

    await writeAuditLog({
      actorType: req.user.type === "TENANT" ? "TENANT_USER" : "TENANT_STAFF",
      [req.user.type === "TENANT" ? "userId" : "tenantStaffId"]: actorUserId,
      tenantId,
      action: "TENANT_PERMISSIONS_ASSIGNED",
      entity: "TENANT_ROLE",
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
      `[assignPermissionsToTenantRole] error: ${err.message}`,
      err
    );

    res.status(500).json({
      success: false,
      message: "Failed to assign permissions",
    });
  }
};


