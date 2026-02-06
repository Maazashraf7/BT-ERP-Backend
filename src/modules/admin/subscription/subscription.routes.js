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

const router = Router();

// 🔓 Public route to compare subscriptions

router.use(authMiddleware);



// 👑 SUBSCRIPTION MANAGEMENT
router.get("/", requirePermission("VIEW_SUBSCRIPTION_PLAN"), listSubscriptions);
router.get("/:subscriptionId", requirePermission("VIEW_SUBSCRIPTION_PLAN"), getSubscriptionDetails);
// 🚀 Setup Default Plans
router.post("/setup-defaults", requirePermission("SETUP_DEFAULT_PLANS"), setupDefaultSubscriptions);




export default router;