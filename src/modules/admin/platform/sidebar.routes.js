import express from "express";
import {
    createSidebar,
    listSidebars,
    assignSidebarToRole,
    getRoleSidebars
} from "./sidebar.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Sidebar Items CRUD
router.post("/", requirePermission("CREATE_PLATFORM_SIDEBAR"), createSidebar);
router.get("/", requirePermission("VIEW_PLATFORM_SIDEBAR"), listSidebars);

// Assignment
router.post("/assign", requirePermission("ASSIGN_PLATFORM_SIDEBAR"), assignSidebarToRole);
router.get("/role/:roleId", requirePermission("VIEW_PLATFORM_SIDEBAR"), getRoleSidebars);

export default router;
