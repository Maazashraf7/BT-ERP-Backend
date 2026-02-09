import { Router } from "express";
import {
  createTenant,
  listTenants,
  updateTenant,
  deleteTenant,
  toggleTenantStatus,
  getTenantDetails,
  tenatPlanHistory,
} from "./tenant.controller.js";

import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

// router.use(authMiddleware); // Removed redundant middleware

router.get("/:tenantId/plan-history", (req, res, next) => {
  console.log("Plan History Route Hit - Params:", req.params);
  tenatPlanHistory(req, res, next);
});

router.get("/", listTenants);
// Create tenant (onboarding)
router.post("/", createTenant);


// Get all tenants (list)

// Get tenant details
router.get("/:tenantId", getTenantDetails);

// Update tenant details
router.put("/:tenantId", updateTenant);

// Delete tenant
router.delete("/:tenantId", deleteTenant);

// Activate / Deactivate tenant
router.patch("/:tenantId/status", toggleTenantStatus);

// router.get("/:tenantId/plan-history", tenatPlanHistory); // Moved to top

export default router;
