import { Router } from "express";

// Tenant Controllers / Routes
import meRoutes from "./me/me.routes.js";
import roleRoutes from "./admin/roles/role.routes.js";
import userRoutes from "./admin/users/user.routes.js";
import staffRoutes from "./admin/management/staff.routes.js";
import tenantSettingsRoutes from "./admin/settings/settings.routes.js";
import tenantBrandingRoutes from "./admin/branding/branding.routes.js";
import adminDashboardRoutes from "./admin/dashboard/dashboard.routes.js";
import adminSidebarRoutes from "./sidebar/sidebar.routes.js";
import auditRoutes from "./audit/audit.routes.js";
import permissionRoutes from "./admin/permissions/permission.routes.js";


// Middleware
import { authMiddleware } from "../core/middlewares/auth.middleware.js";
import { checkSubscription } from "../core/middlewares/subscription.middleware.js";

const router = Router();
// -----------------------------
// 🔓 Public Routes
// -----------------------------

// Middleware to ensure user login for these routes
// (We apply it here so all sub-routes are protected and have req.user)
router.use(authMiddleware);

// Security Check: Ensure authenticated user matches the resolved tenant
router.use((req, res, next) => {
    if (req.user.type === 'SUPER_ADMIN') return next(); // Super Admins can access any tenant context

    if (!req.tenant) {
        return res.status(500).json({ message: "Tenant context missing" });
    }

    if (req.user.tenantId !== req.tenant.id) {
        return res.status(403).json({
            success: false,
            message: "Cross-Tenant Access Denied"
        });
    }
    next();
});


router.use(checkSubscription)

// -----------------------------
// 🏫 TENANT ROUTES
// -----------------------------
// Prefix: /api/v1/:tenantName/...

router.use("/me", meRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/management-staff", staffRoutes);
router.use("/permissions", permissionRoutes);
router.use("/tenant-settings", tenantSettingsRoutes);
router.use("/tenant/branding", tenantBrandingRoutes);
router.use("/dashboard", adminDashboardRoutes);
router.use("/sidebar", adminSidebarRoutes);
router.use("/audit", auditRoutes);

export default router;
