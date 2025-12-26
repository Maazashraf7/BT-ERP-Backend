import { Router } from "express";
import {
  createModule,
  listModules,
  toggleTenantModule,
  getTenantModules,
 
  getCommonModules,
  makeModuleCommon,
  deleteModule, 
  deleteAllModules,


} from "./module.controller.js";

import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// 👑 MODULE CATALOG
router.post("/", requireSuperAdmin, createModule);
router.get("/", requireSuperAdmin, listModules);
router.get("/common", requireSuperAdmin, getCommonModules);
// router.get("/:moduleId", requireSuperAdmin, getModuleDetails);
// router.put("/:moduleId", requireSuperAdmin, updateModule);
router.delete("/:moduleId", requireSuperAdmin, deleteModule);
router.post("/:moduleId/make-common", requireSuperAdmin, makeModuleCommon);
router.delete("/delete-all", requireSuperAdmin, deleteAllModules);
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
