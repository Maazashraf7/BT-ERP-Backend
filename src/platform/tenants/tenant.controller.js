import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "../audit/audit.helper.js";

export const createTenant = async (req, res) => {
  try {
    const { name, type, adminEmail, adminPassword } = req.body;
    const superAdminId = req.user.id;

    if (!name || !type || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name, type },
      });

      const adminRole = await tx.role.create({
        data: {
          name: "Admin",
          tenantId: tenant.id,
        },
      });

      await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          tenantId: tenant.id,
          roleId: adminRole.id,
        },
      });

      const trialPlan = await tx.plan.findFirst({
        where: { name: "TRIAL", isActive: true },
      });

      if (!trialPlan) throw new Error("Trial plan not configured");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + trialPlan.duration);

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: trialPlan.id,
          status: "ACTIVE",
          startDate,
          endDate,
        },
      });

      const planModules = await tx.planModule.findMany({
        where: { planId: trialPlan.id },
      });

      if (planModules.length) {
        await tx.tenantModule.createMany({
          data: planModules.map((pm) => ({
            tenantId: tenant.id,
            moduleId: pm.moduleId,
            enabled: true,
          })),
        });
      }

      await writeAuditLog({
        actorType: "SUPER_ADMIN",
        superAdminId,
        action: "TENANT_CREATED",
        entity: "TENANT",
        entityId: tenant.id,
        meta: { name, adminEmail, plan: trialPlan.name },
        req,
      });

      return { tenant, subscription };
    });

    res.status(201).json({
      success: true,
      tenant: result.tenant,
      subscription: {
        plan: "TRIAL",
        expiresAt: result.subscription.endDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tenant",
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
          include: { plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        isActive: t.isActive,
        createdAt: t.createdAt,
        plan: t.subscriptions[0]?.plan.name ?? "NONE",
        expiresAt: t.subscriptions[0]?.endDate ?? null,
      })),
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch tenants" });
  }
};

export const deactivateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const superAdminId = req.user.id;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_DEACTIVATED",
      entity: "TENANT",
      entityId: tenantId,
      req,
    });

    res.json({
      success: true,
      message: "Tenant deactivated successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to deactivate tenant",
    });
  }
};

export const toggleTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;
    const superAdminId = req.user.id;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be boolean",
      });
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: isActive ? "TENANT_ACTIVATED" : "TENANT_DEACTIVATED",
      entity: "TENANT",
      entityId: tenantId,
      req,
    });

    res.json({
      success: true,
      message: isActive ? "Tenant activated" : "Tenant deactivated",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update tenant status",
    });
  }
};

export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        roles: true,
        subscriptions: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          include: { plan: true },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const activeSub = tenant.subscriptions[0] ?? null;

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        roles: tenant.roles.map((r) => r.name),
        activeSubscription: activeSub
          ? {
              plan: activeSub.plan.name,
              expiresAt: activeSub.endDate,
            }
          : null,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant details",
    });
  }
};

/**
 * SUPER ADMIN
 * Restore Tenant
 */

export const restoreTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const superAdminId = req.user.id;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: true },
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_RESTORED",
      entity: "TENANT",
      entityId: tenantId,
      req,
    });

    res.json({
      success: true,
      message: "Tenant restored successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restore tenant",
    });
  }
};


/**
 * SUPER ADMIN
 * Upgrade / Change Tenant Plan
 */
export const changeTenantPlan = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { planName } = req.body;
    const superAdminId = req.user.id;

    const plan = await prisma.plan.findFirst({
      where: { name: planName, isActive: true },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Expire old subscriptions
      await tx.subscription.updateMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        data: { status: "EXPIRED" },
      });

      // 2️⃣ Create new subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);

      await tx.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          status: "ACTIVE",
          startDate,
          endDate,
        },
      });

      // 3️⃣ Reset tenant modules
      await tx.tenantModule.deleteMany({
        where: { tenantId },
      });

      const planModules = await tx.planModule.findMany({
        where: { planId: plan.id },
      });

      if (planModules.length) {
        await tx.tenantModule.createMany({
          data: planModules.map((pm) => ({
            tenantId,
            moduleId: pm.moduleId,
            enabled: true,
            source: "PLAN",
          })),
        });
      }
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_PLAN_CHANGED",
      entity: "TENANT",
      entityId: tenantId,
      meta: { plan: planName },
      req,
    });

    res.json({
      success: true,
      message: `Tenant plan changed to ${planName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change tenant plan",
    });
  }
};


/**
 * SUPER ADMIN
 * Override Tenant Module
 */
export const overrideTenantModule = async (req, res) => {
  try {
    const { tenantId, moduleId } = req.params;
    const { enabled, source, limit, expiresAt } = req.body;
    const superAdminId = req.user.id;

    const tenantModule = await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: { tenantId, moduleId },
      },
      update: {
        enabled,
        source: source || "MANUAL",
        limit,
        expiresAt,
      },
      create: {
        tenantId,
        moduleId,
        enabled,
        source: source || "MANUAL",
        limit,
        expiresAt,
      },
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_MODULE_OVERRIDDEN",
      entity: "MODULE",
      entityId: moduleId,
      meta: {
        tenantId,
        enabled,
        source,
        limit,
        expiresAt,
      },
      req,
    });

    res.json({
      success: true,
      tenantModule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to override tenant module",
    });
  }
};
  

/**
 * SUPER ADMIN
 * Tenant Usage Metrics
 */
export const getTenantUsageMetrics = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      modules,
      subscription,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
      prisma.user.count({ where: { tenantId, isActive: false } }),
      prisma.tenantModule.count({
        where: { tenantId, enabled: true },
      }),
      prisma.subscription.findFirst({
        where: {
          tenantId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: { plan: true },
      }),
    ]);

    res.json({
      success: true,
      usage: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        modulesEnabled: modules,
        plan: subscription?.plan.name ?? "NONE",
        expiresAt: subscription?.endDate ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant usage metrics",
    });
  }
};
