import { Router } from "express";
import { getMyUI } from "./me.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/config", authMiddleware, getMyUI);

export default router;
