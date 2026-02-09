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

// ------------------------------------
// 👑 SUPER ADMIN — TENANT MANAGEMENT
// ------------------------------------

router.use(authMiddleware);

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

router.get("/:tenantId/plan-history", tenatPlanHistory);

export default router;
