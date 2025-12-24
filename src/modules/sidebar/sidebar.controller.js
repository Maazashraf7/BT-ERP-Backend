import prisma from "../../core/config/db.js";
import { buildSidebar } from "./sidebar.service.js";
import logger from "../../core/utils/logger.js";

export const getAdminSidebar = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user?.id ?? null;
    const tenantType = req.user?.tenant?.type ?? null;

    // Normalize permissions: allow array of strings or objects with `key`
    const rawPermissions = req.user?.permissions ?? [];
    const permissions = Array.isArray(rawPermissions)
      ? rawPermissions.map(p => (typeof p === 'string' ? p : p?.key)).filter(Boolean)
      : [];

    logger.info(`[getAdminSidebar] start - user=${userId} tenant=${tenantId} type=${tenantType}`);

    // 1️⃣ Tenant enabled modules
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId, enabled: true },
      include: { module: true },
    });

    // 2️⃣ Common modules
    const commonModules = await prisma.module.findMany({
      where: { isCommon: true },
      select: { key: true },
    });

    // Normalize module keys (case-insensitive match with SIDEBAR_TREE)
    const enabledModules = Array.from(new Set([
      ...commonModules.map(m => (m.key || '').toUpperCase()),
      ...tenantModules.map(tm => ((tm.module && tm.module.key) || '').toUpperCase()),
    ])).filter(Boolean);

    logger.debug(`[getAdminSidebar] commonModules=${JSON.stringify(commonModules.map(m=>m.key))}`);
    logger.debug(`[getAdminSidebar] tenantModules=${JSON.stringify(tenantModules.map(tm=>tm.module?.key))}`);
    logger.debug(`[getAdminSidebar] enabledModules=${JSON.stringify(enabledModules)}`);

    const sidebar = buildSidebar({
      tenantType,
      enabledModules,
      permissions,
    });

    logger.info(`[getAdminSidebar] success - items=${sidebar.length}`);

    res.json({
      success: true,
      sidebar,
    });
  } catch (err) {
    logger.error(`[getAdminSidebar] error: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to load sidebar",
    });
  }
};

