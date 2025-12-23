import prisma from "../../../core/config/db.js";

/**
 * TENANT ADMIN
 * List all permissions
 */
export const listPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { key: "asc" },
    });

    res.json({
      success: true,
      permissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};
