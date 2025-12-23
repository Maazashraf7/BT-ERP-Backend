import { Router } from "express";
import {
  createModule,
  listModules,
  toggleTenantModule,
  getTenantModules,
} from "./module.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// 👑 MODULE MANAGEMENT
router.post("/", requireSuperAdmin, createModule);
router.get("/", requireSuperAdmin, listModules);

// 👑 TENANT MODULE CONTROL
router.post(
  "/tenants/:tenantId",
  requireSuperAdmin,
  toggleTenantModule
);

router.get(
  "/tenants/:tenantId",
  requireSuperAdmin,
  getTenantModules
);

export default router;
