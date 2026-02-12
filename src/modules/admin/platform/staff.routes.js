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

router.post("/register", requirePermission("STAFF_CREATE"), registerPlatformStaff);
router.get("/", requirePermission("STAFF_READ"), listPlatformStaff);
router.patch("/:id", requirePermission("STAFF_UPDATE"), updatePlatformStaff);
router.delete("/:id", requirePermission("STAFF_DELETE"), deletePlatformStaff);


export default router;
