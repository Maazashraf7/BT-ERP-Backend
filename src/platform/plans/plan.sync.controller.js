import prisma from "../../core/config/db.js";
import { syncTenantModulesFromPlan } from "./plan.service.js";

/**
 * 👑 Sync plan modules to all tenants on that plan
 */
export const syncPlanToTenants = async (req, res) => {
  try {
    const { planId } = req.params;
    const { mode = "SAFE" } = req.body;

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

    await prisma.$transaction(async (tx) => {
      for (const { tenantId } of subscriptions) {
        await syncTenantModulesFromPlan(
          tx,
          tenantId,
          planId,
          mode === "STRICT"
        );
        updatedCount++;
      }
    });

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
