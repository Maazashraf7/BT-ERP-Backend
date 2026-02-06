import { Router } from "express";
import { assignFeatureToTenant, getTeanantsAssignedFeaturesByTenantId, removeFeatureFromTenant } from "./tenantsfeatures.contorller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware";
import { checkSubscription } from "../../../core/middlewares/subscription.middleware.js";
import { checkFeatureInPlan } from "../../../core/middlewares/fetures.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(checkSubscription);
router.use(checkFeatureInPlan);


// For 
router.post("/choose-features", requirePermission("add-tenant-feature"), assignFeatureToTenant);
router.get("/get-tenant-features/:tenantId", requirePermission("get-tenant-features"), getTeanantsAssignedFeaturesByTenantId);
router.delete("/remove-tenant-feature", requirePermission("remove-tenant-feature"), removeFeatureFromTenant);

export default router;