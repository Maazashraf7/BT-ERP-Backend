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

    // 2️⃣ Plan allowed modules (PLAN ONLY)
    const planModules = await prisma.planModule.findMany({
      where: { planId },
      include: { module: true },
      orderBy: { module: { name: "asc" } },
    });

    // 3️⃣ Tenant enabled modules
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId },
      select: { moduleId: true, enabled: true },
    });

    const tenantModuleMap = new Map(
      tenantModules.map(tm => [tm.moduleId, tm.enabled])
    );

    // 4️⃣ Build response (PLAN MODULES ONLY)
    const modules = planModules.map(({ module }) => {
      const enabled = tenantModuleMap.get(module.id) ?? true;

      return {
        id: module.id,
        key: module.key,
        name: module.name,
        enabled,
        status: enabled ? "ACTIVE" : "DISABLED",
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
