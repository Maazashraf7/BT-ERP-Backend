import { Router } from "express";
import {
  createRole,
  assignPermissionsToRole,
  getRoles,
  getRoleById,
} from "./role.controller.js";

import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createRole);
router.post("/:roleId/permissions", authMiddleware, assignPermissionsToRole);
router.get("/", authMiddleware, getRoles);
router.get("/:roleId", authMiddleware, getRoleById);

export default router;
