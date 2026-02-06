import { Router } from "express";
import {
  createPlan,
  listPlans,
  updatePlan,
  assignPlanToTenant,
  setupDefaultPlans,
  getPlanDetails,
  deletePlan,
} from "./plan.controller.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { assignFeatureToPlan, getAllFeaturesInAPlan, removeFeatureFromPlan, updateFeatureInPlan } from "./plan.andfeature.controller.js";

const router = Router();

// 🔓 Public route to compare plans

router.use(authMiddleware);


// 👑 PLAN MANAGEMENT
router.post("/", requirePermission("CREATE_SUBSCRIPTION_PLAN"), createPlan);
router.get("/", requirePermission("VIEW_SUBSCRIPTION_PLAN"), listPlans);
router.get("/:planId", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getPlanDetails);
router.put("/:planId", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), updatePlan);
router.delete("/:planId", requirePermission("DELETE_SUBSCRIPTION_PLAN"), deletePlan);

// 🏢 Tenant Assignment
router.post("/tenants/:tenantId/assign", requirePermission("ASSIGN_PLAN_TO_TENANT"), assignPlanToTenant);

// 🚀 Setup Default Plans
router.post("/setup-defaults", requirePermission("SETUP_DEFAULT_PLANS"), setupDefaultPlans);



// plan and feature management
router.post("/assign-featureToPlan", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), assignFeatureToPlan);
router.post("/remove-featureFromPlan", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), removeFeatureFromPlan);
router.post("/update-featureInPlan", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), updateFeatureInPlan);
router.post("/get-allFeaturesInPlan", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getAllFeaturesInAPlan);

export default router;