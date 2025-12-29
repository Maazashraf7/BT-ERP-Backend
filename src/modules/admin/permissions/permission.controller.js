import prisma from "../../../core/config/db.js";

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
