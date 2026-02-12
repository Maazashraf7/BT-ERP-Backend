import express from "express";
import {
    registerPlatformStaff,
    listPlatformStaff,
    updatePlatformStaff,
    deletePlatformStaff,
    loginPlatformStaff,
} from "./staff.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = express.Router();

// Public login
router.post("/login", loginPlatformStaff);

// Protected routes
router.use(authMiddleware);

router.post("/register", registerPlatformStaff);
router.get("/", listPlatformStaff);
router.patch("/:id", updatePlatformStaff);
router.delete("/:id", deletePlatformStaff);


export default router;
