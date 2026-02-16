import express from "express";
import {
    registerPlatformStaff,
    listPlatformStaff,
    updatePlatformStaff,
    deletePlatformStaff,
    loginPlatformStaff,
} from "./staff.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";

const router = express.Router();

// Public login
router.post("/login", loginPlatformStaff);

// Protected routes
router.use(authMiddleware);

router.post("/register", requirePermission("CREATE_STAFF"), registerPlatformStaff);
router.get("/", requirePermission("VIEW_STAFF"), listPlatformStaff);
router.patch("/:id", requirePermission("UPDATE_STAFF"), updatePlatformStaff);
router.delete("/:id", requirePermission("DELETE_STAFF"), deletePlatformStaff);


export default router;
