import prisma from "../config/db.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    if (req.user.type === "SUPER_ADMIN") return next();

    const role = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const hasPermission = role.permissions.some(
      (rp) => rp.permission.key === permissionKey
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    next();
  };
};
