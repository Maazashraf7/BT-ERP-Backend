import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";

export const createTenant = async (req, res) => {
  try {
    const { name, type, adminEmail, adminPassword } = req.body;

    // -----------------------------
    // 1. Create Tenant
    // -----------------------------
    const tenant = await prisma.tenant.create({
      data: { name, type }
    });

    // -----------------------------
    // 2. Create Default Admin Role
    // -----------------------------
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        tenantId: tenant.id
      }
    });

    // -----------------------------
    // 3. Create Admin User
    // -----------------------------
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        tenantId: tenant.id,
        roleId: adminRole.id
      }
    });

    // -----------------------------
    // 4. Assign TRIAL Subscription
    // -----------------------------
    const trialPlan = await prisma.plan.findFirst({
      where: { name: "TRIAL", isActive: true }
    });

    if (!trialPlan) {
      return res.status(500).json({
        success: false,
        message: "Trial plan not configured"
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + trialPlan.duration);

    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: trialPlan.id,
        status: "ACTIVE",
        startDate,
        endDate
      }
    });

    // -----------------------------
    // 5. Enable Default Modules (by Plan)
    // -----------------------------
    const planModules = await prisma.planModule.findMany({
      where: { planId: trialPlan.id },
      include: { module: true }
    });

    for (const pm of planModules) {
      await prisma.tenantModule.create({
        data: {
          tenantId: tenant.id,
          moduleId: pm.moduleId,
          enabled: true
        }
      });
    }

    // -----------------------------
    // RESPONSE
    // -----------------------------
    res.status(201).json({
      success: true,
      message: "Tenant onboarded successfully",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type
      },
      subscription: {
        plan: trialPlan.name,
        expiresAt: endDate
      }
    });

  } catch (error) {
    console.error("Create tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tenant"
    });
  }
};
export const getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();

    res.status(200).json({
      success: true,
      tenants
    });
  } catch (error) {
    console.error("Get tenants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tenants"
    });
  }
};

export const listTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptions: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = tenants.map((tenant) => {
      const activeSub = tenant.subscriptions[0];

      return {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        plan: activeSub ? activeSub.plan.name : "NONE",
        expiresAt: activeSub ? activeSub.endDate : null,
      };
    });

    res.json({
      success: true,
      tenants: result,
    });
  } catch (error) {
    console.error("LIST TENANTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
    });
  }
};
export const toggleTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
    });

    res.json({
      success: true,
      message: isActive
        ? "Tenant activated successfully"
        : "Tenant deactivated successfully",
    });
  } catch (error) {
    console.error("TOGGLE TENANT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tenant status",
    });
  }
};
