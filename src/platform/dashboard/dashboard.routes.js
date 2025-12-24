import { Router } from "express";
import { getSuperAdminDashboardSummary } from "./dashboard.controller.js";
import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

router.get("/summary", requireSuperAdmin, getSuperAdminDashboardSummary);

export default router;
