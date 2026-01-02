import prisma from "../../core/config/db.js";
import { buildSidebar } from "../../core/ui/ui.sidebar.builder.js";
import { buildDashboard } from "../admin/dashboard/dashboard.builder.js";

export const getMyUI = async (req, res) => {
  try {
    const { tenantId, roleId, permissions, tenant } = req.user;

    // 🔍 DEBUG (temporary)
    console.log("PERMISSIONS:", permissions);

    /**
     * 1️⃣ Resolve enabled modules FIRST
     * (must come before any usage)
     */
    const tenantModules = await prisma.tenantModule.findMany({
      where: {
        tenantId,
        enabled: true,
      },
      include: {
        module: true,
      },
    });

    const enabledModules = tenantModules.map(
      (tm) => tm.module.key
    );

    // 🔍 DEBUG (temporary)
    console.log("ENABLED MODULES:", enabledModules);

    /**
     * 2️⃣ Build sidebar
     */
    const sidebar = buildSidebar({
      permissions,
      tenantType: tenant.type,
      enabledModules,
    });

    /**
     * 3️⃣ Build dashboard
     */
    const dashboard = await buildDashboard({
      tenantId,
      roleId,
      permissions,
      enabledModules,
    });

    return res.json({
      success: true,
      ui: {
        sidebar,
        dashboard,
      },
    });
  } catch (err) {
    console.error("ME/UI ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load UI",
    });
  }
};
