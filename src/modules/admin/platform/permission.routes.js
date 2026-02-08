import express from "express";
import {
    createPlatformPermission,
    updatePlatformPermission,
    listPlatformPermissions,
    assignPermissionsToPlatformRole,
    createPlatformPermissionDomain,
    listPlatformPermissionDomains,
    updatePlatformPermissionDomain,
    deletePlatformPermissionDomain
} from "./permission.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Platform Permissions
router.post("/", requirePermission("CREATE_PLATFORM_PERMISSION"), createPlatformPermission);
router.put("/:id", requirePermission("UPDATE_PLATFORM_PERMISSION"), updatePlatformPermission);
router.get("/", requirePermission("VIEW_PLATFORM_PERMISSIONS"), listPlatformPermissions);
router.post("/assign/:roleId", requirePermission("ASSIGN_PLATFORM_PERMISSIONS"), assignPermissionsToPlatformRole);

// Platform Permission Domains
router.post("/domains", requirePermission("CREATE_PLATFORM_PERMISSION_DOMAIN"), createPlatformPermissionDomain);
router.get("/domains", requirePermission("VIEW_PLATFORM_PERMISSION_DOMAINS"), listPlatformPermissionDomains);
router.put("/domains/:id", requirePermission("UPDATE_PLATFORM_PERMISSION_DOMAIN"), updatePlatformPermissionDomain);
router.delete("/domains/:id", requirePermission("DELETE_PLATFORM_PERMISSION_DOMAIN"), deletePlatformPermissionDomain);

export default router;

