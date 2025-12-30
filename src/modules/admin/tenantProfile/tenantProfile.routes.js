import { Router } from "express";
import { upsertTenantProfile, getTenantProfile } from "./tenantProfile.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.put("/profile", authMiddleware, upsertTenantProfile);
router.get("/profile", authMiddleware, getTenantProfile);
export default router;
