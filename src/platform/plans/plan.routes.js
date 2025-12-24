import { Router } from "express";
import {
  createPlan,
  listPlans,
  updatePlan,
  assignPlanToTenant,
  updatePlanModules,
} from "./plan.controller.js";
import { comparePlans } from "./plan.public.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();
//public route to compare plans
router.get("/compare", comparePlans);

// 👑 PLAN MANAGEMENT
router.post("/", requireSuperAdmin, createPlan);
router.get("/", requireSuperAdmin, listPlans);
router.put("/:planId", requireSuperAdmin, updatePlan);
router.post("/tenants/:tenantId/assign", requireSuperAdmin, assignPlanToTenant);
router.put("/:planId/modules", requireSuperAdmin, updatePlanModules);
export default router;