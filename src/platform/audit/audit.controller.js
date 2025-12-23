import prisma from "../../core/config/db.js";

// 👑 Super Admin: All audits
export const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch audits" });
  }
};

// 🏫 Tenant Admin: Tenant-only audits
export const getTenantAuditLogs = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const logs = await prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch audits" });
  }
};
