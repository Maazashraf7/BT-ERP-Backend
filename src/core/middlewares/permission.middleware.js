import prisma from "../config/db.js";
import {
  getCachedPermissions,
  setCachedPermissions
} from "../cache/permission.cache.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const { roleId } = req.user;

      // 1️⃣ Try cache first
      let permissions = getCachedPermissions(roleId);

      if (!permissions) {
        // 2️⃣ Load from DB once
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { roleId },
          include: { permission: true },
        });

        permissions = rolePermissions.map(
          (rp) => rp.permission.key
        );

        // 3️⃣ Cache it
        setCachedPermissions(roleId, permissions);
      }

      // 4️⃣ Check permission
      if (!permissions.has(permissionKey)) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch (err) {
      console.error("Permission middleware error:", err);
      res.status(500).json({
        success: false,
        message: "Permission validation failed",
      });
    }
  };
};
