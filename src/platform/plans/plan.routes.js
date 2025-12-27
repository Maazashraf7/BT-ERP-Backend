import { Router } from "express";
import {
  createPlan,
  listPlans,
  updatePlan,
  assignPlanToTenant,
  updatePlanModules,
  addCommonModulesToPlan,
  setupDefaultPlans,
  getPlanDetails,
  deletePlan,

} from "./plan.controller.js";
import { comparePlans } from "./plan.public.controller.js";
import { getPlanHistory } from "./plan.history.controller.js";
import { syncPlanToTenants } from "./plan.sync.controller.js";
import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();
//public route to compare plans
router.get("/compare", comparePlans);

// 👑 PLAN MANAGEMENT
router.post("/", requireSuperAdmin, createPlan);
router.get("/", requireSuperAdmin, listPlans);
router.delete("/:planId", requireSuperAdmin, deletePlan);
router.put("/:planId", requireSuperAdmin, updatePlan);
router.post("/tenants/:tenantId/assign", requireSuperAdmin, assignPlanToTenant);
router.put("/:planId/modules", requireSuperAdmin, updatePlanModules);
router.post("/setup-defaults", requireSuperAdmin, setupDefaultPlans);
router.post("/:planId/sync-to-tenants", requireSuperAdmin, syncPlanToTenants);
router.get("/:planId", requireSuperAdmin, getPlanDetails);
router.post("/:planId/add-common-modules", requireSuperAdmin, addCommonModulesToPlan);
router.get("/:planId/history", requireSuperAdmin, getPlanHistory);

export default router;