import prisma from "../../core/config/db.js";

export const getSuperAdminDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 🚀 Parallel queries (IMPORTANT)
    const [
      totalTenants,
      activeTenants,
      inactiveTenants,
      tenantsByType,
      totalUsers,
      activeSubscriptions,
      expiringSubscriptions,
      recentTenants,
      topPlans,
      topModules,
      recentAudits,
    ] = await Promise.all([
      prisma.tenant.count(),

      prisma.tenant.count({
        where: { isActive: true },
      }),

      prisma.tenant.count({
        where: { isActive: false },
      }),

      prisma.tenant.groupBy({
        by: ["type"],
        _count: { type: true },
      }),

      prisma.user.count(),

      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),

      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          endDate: {
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      prisma.tenant.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      prisma.subscription.groupBy({
        by: ["planId"],
        _count: { planId: true },
      }),

      prisma.tenantModule.groupBy({
        by: ["moduleId"],
        where: { enabled: true },
        _count: { moduleId: true },
      }),

      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      metrics: {
        tenants: {
          total: totalTenants,
          active: activeTenants,
          inactive: inactiveTenants,
          newLast30Days: recentTenants,
          byType: tenantsByType.map(t => ({
            type: t.type,
            count: t._count.type,
          })),
        },

        users: {
          total: totalUsers,
        },

        subscriptions: {
          active: activeSubscriptions,
          expiringSoon: expiringSubscriptions,
        },

        insights: {
          topPlans,
          topModules,
        },

        activity: {
          recentAudits,
        },
      },
    });
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
};
