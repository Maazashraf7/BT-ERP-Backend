import prisma from "../../core/config/db.js";
import { syncTenantModulesFromPlan } from "./plan.service.js";

/**
 * 👑 Create Plan
 */
export const createPlan = async (req, res) => {
  try {
    const { name, price, duration, moduleKeys = [] } = req.body;

    if (!name || duration == null) {
      return res.status(400).json({
        success: false,
        message: "Name and duration are required",
      });
    }

    // Prevent duplicate plan names
    const existingPlan = await prisma.plan.findUnique({ where: { name } });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: `Plan with name '${name}' already exists`,
      });
    }

    const plan = await prisma.$transaction(async (tx) => {
      const createdPlan = await tx.plan.create({
        data: { name, price: price || 0, duration },
      });

      if (moduleKeys.length > 0) {
        const modules = await tx.module.findMany({
          where: { key: { in: moduleKeys } },
        });

        await tx.planModule.createMany({
          data: modules.map((m) => ({
            planId: createdPlan.id,
            moduleId: m.id,
          })),
        });
      }

      return createdPlan;
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("CREATE PLAN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Delete Plan

 */
export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    await prisma.plan.delete({ where: { id: planId } });
    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
};

/**
 * 👑 List Plans
 */
export const listPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        modules: {
          include: { module: true },
        },
      },
      orderBy: { price: "asc" },
    });

    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

/**
 * 👑 Update Plan (price / duration / active)
 */
export const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { price, duration, isActive } = req.body;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: { price, duration, isActive },
    });

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update plan" });
  }
};

/**
 * 👑 Assign Plan to Tenant (billing-safe)
 */
export const assignPlanToTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { planId, startDate } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive plan",
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + plan.duration);

    await prisma.$transaction(async (tx) => {
      // End previous subscription
      await tx.subscription.updateMany({
        where: {
          tenantId,
          status: "ACTIVE",
        },
        data: { status: "CANCELLED" },
      });

      // Create new subscription
      await tx.subscription.create({
        data: {
          tenantId,
          planId,
          status: "ACTIVE",
          startDate: start,
          endDate: end,
        },
      });

      // 🔥 Module sync
      await syncTenantModulesFromPlan(tx, tenantId, planId);
    });

    res.json({
      success: true,
      message: "Plan assigned successfully",
    });
  } catch (error) {
    console.error("ASSIGN PLAN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** 
 * * 👑 Update Plan Modules
 */		


export const updatePlanModules = async (req, res) => {
  try {
    const { planId } = req.params;
    const { add = [], remove = [] } = req.body;

    // Fetch modules by keys
    const modulesToAdd = add.length
      ? await prisma.module.findMany({
          where: { key: { in: add } },
        })
      : [];

    const modulesToRemove = remove.length
      ? await prisma.module.findMany({
          where: { key: { in: remove } },
        })
      : [];

    await prisma.$transaction(async (tx) => {
      // ADD MODULES
      if (modulesToAdd.length > 0) {
        await tx.planModule.createMany({
          data: modulesToAdd.map((m) => ({
            planId,
            moduleId: m.id,
          })),
          skipDuplicates: true,
        });
      }

      // REMOVE MODULES
      if (modulesToRemove.length > 0) {
        await tx.planModule.deleteMany({
          where: {
            planId,
            moduleId: {
              in: modulesToRemove.map((m) => m.id),
            },
          },
        });
      }
    });

    res.json({
      success: true,
      message: "Plan modules updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PLAN MODULES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update plan modules",
    });
  }
};

/**
 * * 👑 Setup Default Plans (if not exist)
 */
export const setupDefaultPlans = async (req, res) => {
  try {
    const defaultPlans = [
      {
        name: "TRIAL",
        price: 0,
        duration: 30,
        isActive: true,
      },
      {
        name: "BASIC",
        price: 99,
        duration: 30,
        isActive: true,
      },
      {
        name: "PREMIUM",
        price: 299,
        duration: 30,
        isActive: true,
      },
    ];

    for (const plan of defaultPlans) {
      await prisma.plan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan,
      });
    }

    res.json({
      success: true,
      message: "Default plans setup successfully",
    });
  } catch (error) {
    console.error("SETUP DEFAULT PLANS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to setup default plans",
    });
  }
};

/**
 * 👑 Sync plan modules to all tenants on that plan
 */
export const syncPlanToTenants = async (req, res) => {
  try {
    const { planId } = req.params;
    const { mode = "SAFE" } = req.body || {};
    const subscriptions = await prisma.subscription.findMany({
      where: {
        planId,
        status: "ACTIVE",
      },
      select: { tenantId: true },
    });
    if (subscriptions.length === 0) {
      return res.json({
        success: true,
        message: "No active tenants on this plan",
      });
    }
    let updatedCount = 0;
    // Run a separate interactive transaction per tenant to avoid one long
    // transaction timing out or becoming invalid for many queries.
    for (const { tenantId } of subscriptions) {
      await prisma.$transaction(
        async (tx) => {
          await syncTenantModulesFromPlan(
            tx,
            tenantId,
            planId,
            mode === "STRICT"
          );
        },
        // increase timeout per-tenant (ms) to allow larger plans to complete
        { timeout: 30000 }  
      );
      updatedCount++;
    }
    res.json({
      success: true,
      message: `Plan synced to ${updatedCount} tenants`,
      mode,
    });
  } catch (error) {
    console.error("SYNC PLAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync plan to tenants",
    });
  }
};

/**
 * 👑 SUPER ADMIN get plan details
 */
export const getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        modules: {
          include: { module: true },
        },
      },
    });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }
    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("GET PLAN DETAILS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan details",
    });
  }   
};

/**
 * * 👑 SUPER ADMIN add common modules to plan
 *  */
export const addCommonModulesToPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const commonModules = await prisma.module.findMany({
      where: { isCommon: true },
    });
    if (commonModules.length === 0) {
      return res.json({
        success: true,
        message: "No common modules to add",
      });
    }
    await prisma.planModule.createMany({
      data: commonModules.map((m) => ({
        planId,
        moduleId: m.id,
      })),
      skipDuplicates: true,
    });
    res.json({
      success: true,
      message: "Common modules added to plan successfully",
    });
  } catch (error) {
    console.error("ADD COMMON MODULES TO PLAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add common modules to plan",
    });
  }
};