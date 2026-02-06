import express from "express";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";
import {
    registerManagementStaff,
    listManagementStaff,
    updateManagementStaff,
    deleteManagementStaff
} from "./staff.controller.js";

const router = express.Router();

router.use(authMiddleware);

// 👔 Management Staff Routes (Tenant Level)
router.post("/", requirePermission("STAFF_CREATE"), registerManagementStaff);
router.get("/", requirePermission("STAFF_VIEW"), listManagementStaff);
router.patch("/:id", requirePermission("STAFF_UPDATE"), updateManagementStaff);
router.delete("/:id", requirePermission("STAFF_DELETE"), deleteManagementStaff);

export default router;
