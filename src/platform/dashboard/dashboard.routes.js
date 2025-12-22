import { Router } from "express";
import {
  getPlatformStats,
} from "./dashboard.controller.js";
import {listTenants,
  toggleTenantStatus,} from "../tenants/tenant.controller.js";
// import { requireSuperAdmin } from "../../core/middlewares/superAdmin.middleware.js";

const router = Router();

router.get("/stats", getPlatformStats);
router.get("/tenants", listTenants);
router.patch("/tenants/:tenantId/status", toggleTenantStatus);

export default router;
