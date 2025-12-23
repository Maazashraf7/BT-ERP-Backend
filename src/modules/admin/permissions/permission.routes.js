import { Router } from "express";
import { listPermissions } from "./permission.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, listPermissions);

export default router;
