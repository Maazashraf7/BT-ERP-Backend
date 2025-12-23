import prisma from "../../../core/config/db.js";

/**
 * TENANT ADMIN
 * Create role
 */
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const tenantId = req.user.tenantId;

    if (!name) {
      return res.status(400).json({ message: "Role name required" });
    }

    const role = await prisma.role.create({
      data: { name, tenantId },
    });

    res.status(201).json({
      success: true,
      role,
    });
  } catch (err) {
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

    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((pid) => ({
        roleId,
        permissionId: pid,
      })),
    });

    res.json({
      success: true,
      message: "Permissions assigned",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to assign permissions",
    });
  }
};
