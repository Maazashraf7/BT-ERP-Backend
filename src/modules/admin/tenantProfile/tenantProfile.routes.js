import { Router } from "express";
import { upsertTenantProfile } from "./tenantProfile.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.put("/profile", authMiddleware, upsertTenantProfile);
export default router;
