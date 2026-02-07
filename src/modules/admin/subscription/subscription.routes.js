import { Router } from "express";
import {
  createSubscription,
  listSubscriptions,
  updateSubscription,
  assignSubscriptionToTenant,
  setupDefaultSubscriptions,
  getSubscriptionDetails,
  deleteSubscription,
} from "./subscription.controller.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { assignFeatureToSubscription, getAllFeaturesInASubscription, removeFeatureFromSubscription, updateFeatureInSubscription } from "./subscription.andfeature.controller.js";
import { checkSuperAdmin } from "../../../core/middlewares/superadmin.middleware.js";

const router = Router();

// 🔓 Public route to compare subscriptions

router.get("/", requirePermission("VIEW_SUBSCRIPTION_PLAN"), listSubscriptions);
router.get("/:subscriptionId", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getSubscriptionDetails);
router.use(authMiddleware);
router.use(checkSuperAdmin)
// 👑 SUBSCRIPTION MANAGEMENT
router.post("/assign/:tenantId", requirePermission("ASSIGN_SUBSCRIPTION_PLAN"), assignSubscriptionToTenant);
router.put("/:subscriptionId", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), updateSubscription);
router.delete("/:subscriptionId", requirePermission("DELETE_SUBSCRIPTION_PLAN"), deleteSubscription);

// 🚀 Setup Default Plans
router.post("/setup-defaults", requirePermission("SETUP_DEFAULT_PLANS"), setupDefaultSubscriptions);




export default router;