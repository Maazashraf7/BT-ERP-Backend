import { Router } from "express";
import {
  createModule,
  listModules,
  toggleTenantModule,
  getTenantModules,
} from "./module.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// 👑 MODULE CATALOG
router.post("/", requireSuperAdmin, createModule);
router.get("/", requireSuperAdmin, listModules);

// 👑 TENANT MODULE CONTROL
router.patch(
  "/tenants/:tenantId/modules/:moduleId",
  requireSuperAdmin,
  toggleTenantModule
);

router.get(
  "/tenants/:tenantId/modules",
  requireSuperAdmin,
  getTenantModules
);

export default router;
