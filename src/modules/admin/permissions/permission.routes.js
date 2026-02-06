import { Router } from "express";
import {
    listGroupedPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionsToRole
} from "./permission.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

// List grouped permissions
router.get("/", requirePermission("PERMISSION_VIEW"), listGroupedPermissions);

// CRUD Permissions
router.post("/", requirePermission("PERMISSION_CREATE"), createPermission);
router.put("/:id", requirePermission("PERMISSION_UPDATE"), updatePermission);
router.delete("/:id", requirePermission("PERMISSION_DELETE"), deletePermission);

// Assign permissions to a role (Updates the role)
router.post("/assign/:roleId", requirePermission("ROLE_UPDATE"), assignPermissionsToRole);

export default router;
