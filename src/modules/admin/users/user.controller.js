import prisma from "../../../core/config/db.js";
import bcrypt from "bcryptjs";
import logger from "../../../core/utils/logger.js";

/**
 * TENANT ADMIN
 * Create user
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, roleId } = req.body;
    const tenantId = req.user.tenantId;
    const createdBy = req.user?.id ?? null;

    logger.info(`[createUser] start - user=${createdBy} tenant=${tenantId} email=${email} roleId=${roleId}`);

    if (!email || !password || !roleId) {
      logger.warn(`[createUser] validation failed - missing fields user=${createdBy} tenant=${tenantId}`);
      return res.status(400).json({ message: "All fields required" });
    }

    const hashed = await bcrypt.hash(password, 10);
    logger.debug(`[createUser] password hashed for email=${email}`);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        tenantId,
        roleId,
      },
    });

    logger.info(`[createUser] success - created user id=${user.id} email=${user.email} tenant=${tenantId}`);

    // Create audit log (non-blocking for main flow)
    try {
      const actorType = tenantId ? "TENANT_USER" : "SUPER_ADMIN";
      await prisma.auditLog.create({
        data: {
          actorId: createdBy,
          actorType,
          tenantId,
          action: "USER_CREATED",
          entity: "USER",
          entityId: user.id,
          meta: { email, roleId },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
      logger.info(`[createUser] audit logged for user id=${user.id}`);
    } catch (auditErr) {
      logger.error(`[createUser] failed to create audit log: ${auditErr.message}`, auditErr);
    }

    res.status(201).json({ success: true, user });
  } catch (err) {
    logger.error(`[createUser] error creating user: ${err.message}`, err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};
