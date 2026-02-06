import prisma from "../config/db.js";
import {
  getCachedPermissions,
  setCachedPermissions
} from "../cache/permission.cache.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const { roleId, role } = req.user;

      // 1️⃣ Super Admin Bypass
      // Check both token type and role name for robustness
      if (role === "SUPER_ADMIN") {
        return next();
      }

      if (!roleId) {
        return res.status(403).json({ success: false, message: "No role assigned to user" });
      }

      // 2️⃣ Try cache first
      let permissions = getCachedPermissions(roleId);

      if (!permissions) {
        // 3️⃣ Load from DB if not in cache
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { roleId },
          include: { permission: true },
        });

        const permissionKeys = rolePermissions.map((rp) => rp.permission.key);

        // Cache the keys (Cache implementation handles 'new Set()')
        setCachedPermissions(roleId, permissionKeys);

        // Update local variable to Set for the check below
        permissions = new Set(permissionKeys);
      }
      
      // 4️⃣ Check permission
      if (permissions.has(permissionKey)) {
        return next();
      }

      // 5️⃣ Permission Denied - Build Detailed Error Message
      // Fetch readable permission name
      const permissionDef = await prisma.permission.findUnique({
        where: { key: permissionKey },
        select: { name: true },
      });

      const permName = permissionDef?.name || permissionKey;
      const roleName = role || "Unknown Role";

      return res.status(403).json({
        success: false,
        message: `Role '${roleName}' does not have permission '${permName}'`,
      });

    } catch (err) {
      console.error("Permission Middleware Error:", err);
      res.status(500).json({
        success: false,
        message: "Permission validation failed",
      });
    }
  };
};
