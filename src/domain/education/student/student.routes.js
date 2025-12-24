import { Router } from "express";
import { createStudent, listStudents } from "./student.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../core/middlewares/rbac.middleware.js";
import { requireModule } from "../../core/middlewares/module.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(requireModule("students"));

router.post(
  "/",
  requirePermission("student.create"),
  createStudent
);

router.get(
  "/",
  requirePermission("student.view"),
  listStudents
);

export default router;
