import { Router } from "express";
import { tenantLogin, tenantRegister } from "./auth.controller.js";

const router = Router();

router.post("/login", tenantLogin);
router.post("/register", tenantRegister);


export default router;
