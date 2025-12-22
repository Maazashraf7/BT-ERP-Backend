import { Router } from "express";
import { getMeConfig } from "./me.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/config", authMiddleware, getMeConfig);

export default router;
