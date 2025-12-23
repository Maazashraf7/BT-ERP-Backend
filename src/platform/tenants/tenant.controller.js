import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";

/**
 * SUPER ADMIN: Create Tenant
 */
export const createTenant = async (req, res) => {
  try {
    const { name, type, adminEmail, adminPassword } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!name || !type || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // -----------------------------
    // Transaction (Atomic Operation)
    // -----------------------------
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: { name, type }
      });

      // 2. Create Admin Role
      const adminRole = await tx.role.create({
        data: {
          name: "Admin",
          tenantId: tenant.id
        }
      });

      // 3. Create Admin User
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          tenantId: tenant.id,
          roleId: adminRole.id
        }
      });

      // 4. Fetch Trial Plan
      const trialPlan = await tx.plan.findFirst({
        where: { name: "TRIAL", isActive: true }
      });

      if (!trialPlan) {
        throw new Error("Trial plan not configured");
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + trialPlan.duration);

      // 5. Create Subscription
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: trialPlan.id,
          status: "ACTIVE",
          startDate,
          endDate
        }
      });

      // 6. Enable Plan Modules
      const planModules = await tx.planModule.findMany({
        where: { planId: trialPlan.id }
      });

      if (planModules.length > 0) {
        await tx.tenantModule.createMany({
          data: planModules.map((pm) => ({
            tenantId: tenant.id,
            moduleId: pm.moduleId,
            enabled: true
          }))
        });
      }

      // 7. Audit Log (SUPER ADMIN)
      await tx.auditLog.create({
        data: {
          actorType: "SUPER_ADMIN",
          action: "TENANT_CREATED",
          entity: "TENANT",
          entityId: tenant.id,
          meta: {
            tenantName: name,
            adminEmail,
            plan: trialPlan.name
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        }
      });

      return { tenant, subscription };
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------
    res.status(201).json({
      success: true,
      message: "Tenant onboarded successfully",
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        type: result.tenant.type
      },
      subscription: {
        plan: "TRIAL",
        expiresAt: result.subscription.endDate
      }
    });

  } catch (error) {
    console.error("CREATE TENANT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tenant"
    });
  }
};

/**
 * SUPER ADMIN: List Tenants (Simple)
 */
export const getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json({
      success: true,
      tenants
    });
  } catch (error) {
    console.error("GET TENANTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tenants"
    });
  }
};

/**
 * SUPER ADMIN: List Tenants with Active Subscription
 */
export const listTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptions: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() }
          },
          include: { plan: true }
        }
      },
      orderBy: { createdAt: "desc" }
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
        expiresAt: activeSub ? activeSub.endDate : null
      };
    });

    res.json({
      success: true,
      tenants: result
    });
  } catch (error) {
    console.error("LIST TENANTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants"
    });
  }
};

/**
 * SUPER ADMIN: Activate / Deactivate Tenant
 */
export const toggleTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorType: "SUPER_ADMIN",
        tenantId: tenant.id,
        action: isActive ? "TENANT_ACTIVATED" : "TENANT_DEACTIVATED",
        entity: "TENANT",
        entityId: tenant.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      }
    });

    res.json({
      success: true,
      message: isActive
        ? "Tenant activated successfully"
        : "Tenant deactivated successfully"
    });
  } catch (error) {
    console.error("TOGGLE TENANT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tenant status"
    });
  }
};
