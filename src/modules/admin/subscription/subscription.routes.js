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
import { checkSuperAdmin } from "../../../core/middlewares/superadmin.middleware.js";
import { assignFeatureToSubscription, getAllFeaturesInASubscription } from "./subscription.andfeature.controller.js";

const router = Router();

// 🔓 Public route to compare subscriptions
// 🔓 Public routes
router.get("/", listSubscriptions);


router.use(authMiddleware);
router.use(checkSuperAdmin);

router.get("/all-features", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getAllFeaturesInASubscription);
router.post("/assign-feature-to-subscription",  assignFeatureToSubscription);
router.post("/", requirePermission("CREATE_SUBSCRIPTION_PLAN"), createSubscription);
router.post("/assign/:tenantId", requirePermission("ASSIGN_SUBSCRIPTION_PLAN"), assignSubscriptionToTenant);
router.get("/:subscriptionId", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getSubscriptionDetails);
router.put("/:subscriptionId", requirePermission("UPDATE_SUBSCRIPTION_PLAN"), updateSubscription);
router.delete("/:subscriptionId", requirePermission("DELETE_SUBSCRIPTION_PLAN"), deleteSubscription);

// 🚀 Setup Default Plans
router.post("/setup-defaults", requirePermission("SETUP_DEFAULT_PLANS"), setupDefaultSubscriptions);




export default router;