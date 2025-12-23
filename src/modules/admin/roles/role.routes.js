import { Router } from "express";
import {
  createRole,
  assignPermissionsToRole,
} from "./role.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createRole);
router.post("/:roleId/permissions", authMiddleware, assignPermissionsToRole);

export default router;
