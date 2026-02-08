import { Router } from "express";
import { getAdminSidebar } from "./sidebar.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAdminSidebar);
export default router;
