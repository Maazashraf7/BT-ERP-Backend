import { Router } from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "./role.controller.js";

import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

// Create Role
router.post("/", requirePermission("ROLE_CREATE"), createRole);
// View Roles
router.get("/", requirePermission("ROLE_VIEW"), getRoles);
router.get("/:roleId", requirePermission("ROLE_VIEW"), getRoleById);

// Update Role
router.put("/:roleId", requirePermission("ROLE_UPDATE"), updateRole);

// Delete Role
router.delete("/:roleId", requirePermission("ROLE_DELETE"), deleteRole);

export default router;
