import prisma from "../../core/config/db.js";
import { buildSidebar } from "./sidebar.service.js";
import logger from "../../core/utils/logger.js";

export const getAdminSidebar = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user?.id ?? null;
    const tenantType = req.user.tenant.type;
    const permissions = req.user.permissions;
    console.log("tenantType:", tenantType);

    logger.info(`[getAdminSidebar] start - user=${userId} tenant=${tenantId} type=${tenantType}`);

    // Fetch enabled modules
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId, enabled: true },
      include: { module: true },
    });
    console.log("tenantModules:", tenantModules);


    const enabledModules = tenantModules.map(
      (tm) => tm.module.key
    );
    console.log("enabledModules:", enabledModules);

    const sidebar = buildSidebar({
      tenantType,
      enabledModules,
      permissions,
    });

    logger.info(`[getAdminSidebar] success - generated sidebar with ${sidebar.length} items for tenant=${tenantId}`);

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
