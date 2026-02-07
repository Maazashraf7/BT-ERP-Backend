import { Router } from "express";
import { assignFeatureToTenant, getTeanantsAssignedFeaturesByTenantId, removeFeatureFromTenant } from "./tenantsfeatures.contorller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware";
import { checkSubscription } from "../../../core/middlewares/subscription.middleware.js";
import { checkFeatureInPlan } from "../../../core/middlewares/fetures.middleware.js";

const router = Router();



// For 
router.post("/", requirePermission("ADD_TENANT_FEATURE"), assignFeatureToTenant);
router.get("/:tenantId", requirePermission("GET_TENANT_FEATURES"), getTeanantsAssignedFeaturesByTenantId);
router.delete("/:tenantId", requirePermission("REMOVE_TENANT_FEATURE"), removeFeatureFromTenant);

export default router;