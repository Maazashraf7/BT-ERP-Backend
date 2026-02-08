import express from "express";
import {
    registerTenantStaff,
    listTenantStaff,
    updateTenantStaff,
    deleteTenantStaff,
    loginTenantStaff,
} from "./tenantstaff.controller.js";
import { authMiddleware } from "../../../../core/middlewares/auth.middleware.js";

const router = express.Router();

// Public login for tenant staff
router.post("/login", loginTenantStaff);

// Protected routes
router.use(authMiddleware);

router.post("/register", registerTenantStaff);
router.get("/", listTenantStaff);
router.patch("/:id", updateTenantStaff);
router.delete("/:id", deleteTenantStaff);

export default router;
