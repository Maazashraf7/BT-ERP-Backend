import { Router } from "express";
import { createTenant } from "./tenant.controller.js";
import { requireSuperAdmin } from "../../core/middlewares/platformAuth.middleware.js";

const router = Router();

// Super Admin only (later add middleware)
router.post("/", requireSuperAdmin, createTenant);

export default router;
