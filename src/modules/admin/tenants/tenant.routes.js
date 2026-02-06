import { Router } from "express";
import {
  createTenant,
  listTenants,
  updateTenant,
  deleteTenant,
  toggleTenantStatus,
  getTenantDetails,
} from "./tenant.controller.js";

import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

// ------------------------------------
// 👑 SUPER ADMIN — TENANT MANAGEMENT
// ------------------------------------

router.use(authMiddleware);

// Create tenant (onboarding)
router.post("/", createTenant);


// Get all tenants (list)
router.get("/", listTenants);

// Get tenant details
router.get("/:tenantId", getTenantDetails);

// Update tenant details
router.put("/:tenantId", updateTenant);

// Delete tenant
router.delete("/:tenantId", deleteTenant);

// Activate / Deactivate tenant
router.patch("/:tenantId/status", toggleTenantStatus);

export default router;
