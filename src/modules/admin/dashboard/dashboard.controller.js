import prisma from "../../../core/config/db.js";

/**
 * 🏫 TENANT ADMIN DASHBOARD SUMMARY
 */
export const getAdminDashboardSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // -----------------------------
    // Parallel queries (FAST)
    // -----------------------------
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      enabledModules,
      subscription,
      usersByRole,
      recentActivities,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { tenantId },
      }),

      // Active users
      prisma.user.count({
        where: { tenantId, isActive: true },
      }),

      // Roles
      prisma.role.count({
        where: { tenantId },
      }),

      // Enabled modules
      prisma.tenantModule.count({
        where: { tenantId, enabled: true },
      }),

      // Active subscription
      prisma.subscription.findFirst({
        where: {
          tenantId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: {
          plan: true,
        },
      }),

      // Users grouped by role
      prisma.role.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),

      // Recent audit logs (tenant scoped)
      prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // -----------------------------
    // Response formatting
    // -----------------------------
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalRoles,
        enabledModules,
      },
      subscription: subscription
        ? {
            plan: subscription.plan.name,
            expiresAt: subscription.endDate,
          }
        : null,
      usersByRole: usersByRole.map((r) => ({
        role: r.name,
        count: r._count.users,
      })),
      recentActivities,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
