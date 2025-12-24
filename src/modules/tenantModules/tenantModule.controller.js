import prisma from "../../core/config/db.js";

export const getTenantModules = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // 1️⃣ Active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      });
    }

    const planId = subscription.planId;

    // 2️⃣ Plan allowed modules
    const planModules = await prisma.planModule.findMany({
      where: { planId },
      select: { moduleId: true },
    });

    const planModuleIds = planModules.map(pm => pm.moduleId);

    // 3️⃣ Tenant enabled modules
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId },
      select: { moduleId: true, enabled: true },
    });

    const tenantModuleMap = new Map(
      tenantModules.map(tm => [tm.moduleId, tm.enabled])
    );

    // 4️⃣ All modules (system-wide)
    const allModules = await prisma.module.findMany({
      orderBy: { name: "asc" },
    });

    // 5️⃣ Build response
    const modules = allModules.map(mod => {
      const allowedByPlan =
        mod.isCommon || planModuleIds.includes(mod.id);

      const enabled =
        mod.isCommon
          ? true
          : tenantModuleMap.get(mod.id) ?? false;

      return {
        id: mod.id,
        key: mod.key,
        name: mod.name,
        isCommon: mod.isCommon,
        allowedByPlan,
        enabled,
        status: enabled
          ? "ACTIVE"
          : allowedByPlan
          ? "DISABLED"
          : "LOCKED",
      };
    });

    res.json({
      success: true,
      plan: subscription.plan.name,
      modules,
    });
  } catch (error) {
    console.error("GET TENANT MODULES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load tenant modules",
    });
  }
};
