import { Router } from "express";
import {
  createTenant,
  getTenants,
  listTenants,
  toggleTenantStatus,
  deleteTenant,
} from "./tenant.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// ------------------------------------
// 👑 SUPER ADMIN — TENANT MANAGEMENT
// ------------------------------------

// Create tenant (onboarding)
router.post("/", requireSuperAdmin, createTenant);

// Get all tenants (raw list)
router.get("/", requireSuperAdmin, getTenants);

// Get tenants with active plan info (dashboard view)
router.get("/list", requireSuperAdmin, listTenants);

// Delete tenant
router.delete("/:tenantId", requireSuperAdmin, deleteTenant);

// Activate / Deactivate tenant
router.patch(
  "/:tenantId/status",
  requireSuperAdmin,
  toggleTenantStatus
);

export default router;
