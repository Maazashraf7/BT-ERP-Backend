import prisma from "../../core/config/db.js";

export const writeAuditLog = async ({
  actorType,
  userId,
  superAdminId,
  tenantId,
  action,
  entity,
  entityId,
  meta,
  req,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorType,
        userId,
        superAdminId,
        tenantId,
        action,
        entity,
        entityId,
        meta,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (err) {
    console.error("[AUDIT_LOG_FAILED]", err.message);
  }
};
