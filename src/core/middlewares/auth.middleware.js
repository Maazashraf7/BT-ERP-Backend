import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Enforce tenant user
    if (decoded.type !== "TENANT_USER") {
      return res.status(403).json({ message: "Invalid access type" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true,
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User inactive" });
    }

    if (!user.tenant || !user.tenant.isActive) {
      return res.status(403).json({ message: "Tenant disabled" });
    }

    // 🔥 SAFE PERMISSION EXTRACTION
    const permissions = user.role
      ? user.role.permissions.map((rp) => rp.permission.key)
      : [];

    // ✅ DEFINE req.user (FINAL CONTRACT)
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      role: user.role?.name ?? null,
      permissions,
      tenant: {
        id: user.tenant.id,
        type: user.tenant.type,
        name: user.tenant.name,
      },
    };

    // ✅ DEBUG (TEMP – REMOVE LATER)
    console.log("AUTH USER:", {
      id: req.user.id,
      role: req.user.role,
      permissions: req.user.permissions,
      tenantType: req.user.tenant.type,
    });

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
