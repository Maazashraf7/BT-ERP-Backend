import prisma from "../../core/config/db.js";

export const getMeConfig = async (req, res) => {
  try {
    const { userId, tenantId, roleId } = req.user;

    // ----------------------------------
    // 1️⃣ USER + TENANT
    // ----------------------------------
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || !user.tenant) {
      return res.status(401).json({
        success: false,
        message: "Invalid tenant context",
      });
    }

    // ----------------------------------
    // 2️⃣ ACTIVE SUBSCRIPTION
    // ----------------------------------
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    const hasActiveSubscription = !!subscription;

    // ----------------------------------
    // 3️⃣ ENABLED MODULES
    // ----------------------------------
    let modules = [];

    if (hasActiveSubscription) {
      modules = subscription.plan.modules.map((pm) => ({
        key: pm.module.key,
        name: pm.module.name,
      }));
    }

    // ----------------------------------
    // 4️⃣ ROLE PERMISSIONS
    // ----------------------------------
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    const permissions = rolePermissions.map(
      (rp) => rp.permission.key
    );

    // ----------------------------------
    // 5️⃣ UI CONFIG (SIDEBAR)
    // ----------------------------------
    const sidebar = modules.map((m) => ({
      key: m.key,
      label: m.name,
      icon: resolveIcon(m.key),
      path: `/app/${m.key}`,
    }));

    // ----------------------------------
    // RESPONSE
    // ----------------------------------
    res.json({
      success: true,

      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
      },

      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        type: user.tenant.type,
      },

      subscription: hasActiveSubscription
        ? {
            plan: subscription.plan.name,
            status: subscription.status,
            expiresAt: subscription.endDate,
          }
        : null,

      modules,
      permissions,

      ui: {
        sidebar,
      },
    });
  } catch (error) {
    console.error("ME CONFIG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load configuration",
    });
  }
};

// ----------------------------------
// ICON RESOLVER (CENTRALIZED)
// ----------------------------------
function resolveIcon(key) {
  const map = {
    students: "users",
    attendance: "calendar-check",
    fees: "wallet",
    exams: "file-text",
    batches: "layers",
  };

  return map[key] || "grid";
}
