import { Router } from "express";
import {
    listSuperAdmins,
    loginSuperAdmin,
    createSuperAdmin,
    updateSuperAdmin,
    deleteSuperAdmin
} from "./management.controller.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";

const router = Router();

// Public login
router.post("/login", loginSuperAdmin);

// Protected routes
router.use(authMiddleware);

router.get("/", listSuperAdmins);
router.post("/register", createSuperAdmin);
router.put("/:id", updateSuperAdmin);
router.delete("/:id", deleteSuperAdmin);

export default router;
