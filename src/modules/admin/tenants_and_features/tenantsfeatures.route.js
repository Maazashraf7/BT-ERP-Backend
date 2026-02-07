import { Router } from "express";
import { assignFeatureToTenant, getTeanantsAssignedFeaturesByTenantId, removeFeatureFromTenant } from "./tenantsfeatures.controller.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";


const router = Router();



// For 
router.use(authMiddleware);


router.post("/add", requirePermission("ADD_TENANT_FEATURE"), assignFeatureToTenant);
router.get("/get/:tenantId", requirePermission("GET_TENANT_FEATURES"), getTeanantsAssignedFeaturesByTenantId);
router.delete("/remove/:tenantId", requirePermission("REMOVE_TENANT_FEATURE"), removeFeatureFromTenant);


export default router;