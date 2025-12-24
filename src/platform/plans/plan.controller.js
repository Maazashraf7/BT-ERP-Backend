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
