import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  // 🍪 Check cookies first, then Authorization header
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === "SUPER_ADMIN") {
      // ✅ Handle Super Admin
      console.log("Auth Debug - Decoded:", decoded);
      const admin = await prisma.superAdmin.findUnique({
        where: { id: decoded.userId },
      });
      console.log("Auth Debug - Found Admin:", admin ? admin.id : "Not Found");

      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Admin inactive or not found" });
      }

      req.user = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: "SUPER_ADMIN",
      };
    }
    else if (decoded.type === "STAFF") {
      // ✅ Handle Management Staff
      const staff = await prisma.managementStaff.findUnique({
        where: { id: decoded.userId },
      });

      if (!staff || !staff.isActive) {
        return res.status(401).json({ message: "Staff inactive or not found" });
      }

      req.user = {
        id: staff.id,
        tenantId: staff.tenantId,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        type: "STAFF",
      };
    }
    else if (decoded.type === "USER") {
      // ✅ Handle Regular User (Simplified)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User inactive or not found" });
      }

      req.user = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        type: "USER",
      };
    }
    else if (decoded.type === "TENANT") {
      // ✅    Handle Tenant Account Login
      const tenantId = decoded.tenantId || decoded.userId; // Fallback for various token versions
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant || !tenant.isActive) {
        return res.status(401).json({ message: "Tenant inactive or not found" });
      }

      req.user = {
        id: tenant.id,
        tenantId: tenant.id,
        email: tenant.tenantEmail,
        name: tenant.tenantName,
        role: tenant.role || "TENANT_ADMIN",
        type: "TENANT",
      };
    }

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


