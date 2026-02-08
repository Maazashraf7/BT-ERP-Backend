import prisma from "../../core/config/db.js";
import { buildSidebar } from "./sidebar.service.js";
import logger from "../../core/utils/logger.js";

/**
 * Admin Sidebar API
 * - Uses ONLY tenant enabled modules
 * - Sidebar visibility controlled by:
 *   1. Tenant type (domain)
 *   2. Enabled modules
 *   3. User permissions
 * - Returns UI-ready sidebar (no frontend mapping needed)
 */
export const getAdminSidebar = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id ?? null;
    const tenantType = req.user?.tenant?.type ?? null;

    // Normalize permissions
    const rawPermissions = req.user?.permissions ?? [];
    const permissions = Array.isArray(rawPermissions)
      ? rawPermissions
          .map((p) => (typeof p === "string" ? p : p?.key))
          .filter(Boolean)
      : [];

    logger.info(
      `[getAdminSidebar] start - user=${userId} tenant=${tenantId} type=${tenantType}`
    );

    /**
     * 1️⃣ Fetch ONLY enabled tenant modules
     * (Plan + tenant switches already resolved at tenantModule level)
     */
    const tenantModules = await prisma.tenantModule.findMany({
      where: {
        tenantId,
        enabled: true,
      },
      include: {
        module: {
          select: {
            key: true,
          },
        },
      },
    });

    /**
     * 2️⃣ Normalize enabled module keys (UPPERCASE)
     * This must match SIDEBAR_TREE.module keys
     */
    const enabledModules = tenantModules
      .map((tm) => tm.module?.key?.toUpperCase())
      .filter(Boolean);

    logger.debug(
      `[getAdminSidebar] enabledModules=${JSON.stringify(enabledModules)}`
    );

    /**
     * 3️⃣ Build sidebar tree
     */
    const sidebarTree = buildSidebar({
      tenantType,
      enabledModules,
      permissions,
    });

    /**
     * 4️⃣ Normalize sidebar for frontend (UI-ready)
     */
    const normalizeSidebarForUI = (items = []) =>
      items.map((item) => ({
        id: item.key,
        key: item.key,
        label: item.label,
        icon: item.icon || "file-text",
        route: item.route ?? null,
        children: item.children
          ? normalizeSidebarForUI(item.children)
          : undefined,
      }));

    const sidebar = normalizeSidebarForUI(sidebarTree);

    logger.info(
      `[getAdminSidebar] success - items=${sidebar.length}`
    );

    /**
     * 5️⃣ Final response
     */
    return res.json({
      success: true,
      ui: {
        sidebar,
      },
    });
  } catch (err) {
    logger.error(
      `[getAdminSidebar] error: ${err.message}`,
      err
    );
    return res.status(500).json({
      success: false,
      message: "Failed to load sidebar",
    });
  }
};
