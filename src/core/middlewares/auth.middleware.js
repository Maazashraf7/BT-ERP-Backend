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

    // ✅ Consistent type
    if (decoded.type !== "TENANT_USER") {
      return res.status(403).json({ message: "Invalid access type" });
    }

    // 🔍 Fetch fresh user data
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
    console.log(req.user);


    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User inactive" });
    }

    if (!user.tenant || !user.tenant.isActive) {
      return res.status(403).json({ message: "Tenant disabled" });
    }

    // ✅ DEFINE req.user CONTRACT (VERY IMPORTANT)
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      role: user.role.name,
      permissions: user.role.permissions.map(
        (rp) => rp.permission.key
      ),
      tenant: {
        id: user.tenant.id,
        type: user.tenant.type,   // 🔥 REQUIRED BY SIDEBAR
        name: user.tenant.name,
      },
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
