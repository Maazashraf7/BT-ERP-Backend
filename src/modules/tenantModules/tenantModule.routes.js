import { Router } from "express";
import { getTenantModules } from "./tenantModule.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";


const router = Router();

router.get("/", authMiddleware, getTenantModules);

export default router;
