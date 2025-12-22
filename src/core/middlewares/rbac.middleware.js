import prisma from "../config/db.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    const { roleId } = req.user;

    const allowed = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: { key: permissionKey }
      }
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    next();
  };
};
