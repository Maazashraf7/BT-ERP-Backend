import { Router } from "express";
import { superAdminLogin } from "./auth.controller.js";

const router = Router();

router.post("/login", superAdminLogin);

export default router;
