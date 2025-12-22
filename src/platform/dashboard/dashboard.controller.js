import prisma from "../../core/config/db.js";

export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalUsers,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.tenant.count({ where: { isActive: false } }),
      prisma.user.count({ where: { tenantId: { not: null } } }),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalTenants,
        activeTenants,
        inactiveTenants,
        totalUsers,
        activeSubscriptions,
      },
    });
  } catch (error) {
    console.error("PLATFORM STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
    });
  }
};
