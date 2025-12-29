import { Router } from "express";
import {
  createTenant,
  listTenants,
  deactivateTenant,

  toggleTenantStatus,
  getTenantDetails,
  changeTenantPlan,
  overrideTenantModule,
  restoreTenant,
 getTenantUsageMetrics,
} from "./tenant.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// ------------------------------------
// 👑 SUPER ADMIN — TENANT MANAGEMENT
// ------------------------------------

// Create tenant (onboarding)
router.post("/", requireSuperAdmin, createTenant);

// Get all tenants (raw list)
// router.get("/", requireSuperAdmin, getTenants);

// Get tenants with active plan info (dashboard view)
router.get("/list", requireSuperAdmin, listTenants);

// Delete tenant
// router.delete("/:tenantId", requireSuperAdmin, deleteTenant);

// Restore tenant
router.put("/restore/:tenantId", requireSuperAdmin, restoreTenant);

// Get tenant details
router.get("/:tenantId", requireSuperAdmin, getTenantDetails);

// Change tenant plan
router.put("/:tenantId/plan", requireSuperAdmin, changeTenantPlan);

// Override tenant module
router.put("/:tenantId/modules/:moduleId", requireSuperAdmin, overrideTenantModule);

// Get tenant usage metrics
router.get("/:tenantId/usage", requireSuperAdmin, getTenantUsageMetrics);

// Deactivate tenant
router.delete("/:tenantId", requireSuperAdmin, deactivateTenant);



// Activate / Deactivate tenant
router.patch(
  "/:tenantId/status",
  requireSuperAdmin,
  toggleTenantStatus
);

export default router;
