import { Router } from "express";
import { createUser } from "./user.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createUser);
export default router;
