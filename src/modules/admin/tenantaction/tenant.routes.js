import { Router } from "express";

// Tenant Controllers / Routes
import meRoutes from "../../me/me.routes.js";
import roleRoutes from "../roles/role.routes.js";
import userRoutes from "../featuresa_available/users/user.routes.js";
import staffRoutes from "../management/staff.routes.js";
import tenantSettingsRoutes from "../settings/settings.routes.js";
import tenantBrandingRoutes from "../branding/branding.routes.js";
import adminDashboardRoutes from "../dashboard/dashboard.routes.js";
import adminSidebarRoutes from "../../sidebar/sidebar.routes.js";
import auditRoutes from "../../audit/audit.routes.js";
import permissionRoutes from "../permissions/permission.routes.js";
import tenantsfeaturesRoutes from "../tenants_and_features/tenantsfeatures.route.js";


// Middleware
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { checkSubscription } from "../../../core/middlewares/subscription.middleware.js";
import { checkFeatureInPlan } from "../../../core/middlewares/fetures.middleware.js";

const router = Router();
// -----------------------------
// 🔓 Public Routes
// -----------------------------

// Middleware to ensure user login for these routes
// (We apply it here so all sub-routes are protected and have req.user)
router.use(authMiddleware);

router.use(checkSubscription)
// router.use(checkFeatureInPlan) // ❌ Removed: Requires arguments to work. Apply to specific routes instead.
// -----------------------------
// 🏫 TENANT ROUTES
// -----------------------------
// Prefix: /api/v1/:tenantName/...

router.use("/me", meRoutes);
router.use("/", tenantsfeaturesRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/management-staff", staffRoutes);
router.use("/permissions", permissionRoutes);









// lATTER
router.use("/tenant-settings", tenantSettingsRoutes);
router.use("/tenant/branding", tenantBrandingRoutes);
router.use("/dashboard", adminDashboardRoutes);
router.use("/sidebar", adminSidebarRoutes);
router.use("/audit", auditRoutes);

export default router;
