import express from "express";
import {
    registerPlatformManagement,
    listPlatformManagement,
    updatePlatformManagement,
    deletePlatformManagement,
    loginPlatformManagement,
} from "./staff.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = express.Router();

// Public login
router.post("/login", loginPlatformManagement);

// Protected routes
router.use(authMiddleware);

router.post("/register", registerPlatformManagement);
router.get("/", listPlatformManagement);
router.patch("/:id", updatePlatformManagement);
router.delete("/:id", deletePlatformManagement);


export default router;
