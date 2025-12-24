import express from "express";
import cors from "cors";

// -----------------------------
// Route Imports
// -----------------------------



// 🔐 Auth
import tenantAuthRoutes from "./modules/auth/auth.routes.js";
import superAdminAuthRoutes from "./platform/auth/auth.routes.js";

// 👑 Super Admin (Platform)
import tenantRoutes from "./platform/tenants/tenant.routes.js";
import platformDashboardRoutes from "./platform/dashboard/dashboard.routes.js";
import platformAuditRoutes from "./platform/audit/audit.routes.js";
import modulesRoutes from "./platform/modules/module.routes.js";
import plans from "./platform/plans/plan.routes.js";
import tenantModuleRoutes from "./modules/tenantModules/tenantModule.routes.js";



// 🏫 Tenant Admin
import meRoutes from "./modules/me/me.routes.js";
// import tenantModuleRoutes from "./modules/modules/module.routes.js";
// import tenantSettingsRoutes from "./modules/settings/settings.routes.js";
import permissionRoutes from "./modules/admin/permissions/permission.routes.js";
import roleRoutes from "./modules/admin/roles/role.routes.js";
import userRoutes from "./modules/admin/users/user.routes.js";
import tenantProfileRoutes from "./modules/admin/tenantProfile/tenantProfile.routes.js";
import tenantSettingsRoutes from "./modules/admin/settings/settings.routes.js";
import tenantBrandingRoutes from "./modules/admin/branding/branding.routes.js";
import adminDashboardRoutes from "./modules/admin/dashboard/dashboard.routes.js";
import  adminSidebarRoutes from "./modules/sidebar/sidebar.routes.js";
// -----------------------------
// App Init
// -----------------------------
const app = express();

// -----------------------------
// CORS
// -----------------------------
const origins = process.env.CORS_ORIGINS || "http://localhost:5174";
app.use(
  cors({
    origin: origins.split(","),
    credentials: true,
  })
);

// -----------------------------
// Global Middlewares
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Health Check
// -----------------------------
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "BT-ERP Backend",
    version: "v1",
  });
});

// =============================
// API v1 ROUTES
// =============================
const API_V1 = "/api/v1";

// -----------------------------
// 🔐 AUTH
// -----------------------------
app.use(`${API_V1}/auth`, tenantAuthRoutes);                 // tenant users
app.use(`${API_V1}/super-admin/auth`, superAdminAuthRoutes); // super admin

// public plans comparison
app.use(`${API_V1}/plans`, plans);

// -----------------------------
// 👑 SUPER ADMIN (PLATFORM)
// -----------------------------
app.use(`${API_V1}/super-admin/tenants`, tenantRoutes);
app.use(`${API_V1}/super-admin/dashboard`, platformDashboardRoutes);
app.use(`${API_V1}/audit-logs`, platformAuditRoutes);
app.use(`${API_V1}/super-admin/modules`, modulesRoutes);
app.use(`${API_V1}/super-admin/plans`, plans);
app.use(`${API_V1}/admin/tenant-modules`, tenantModuleRoutes);
  

// -----------------------------
// 🏫 TENANT ADMIN
// -----------------------------
app.use(`${API_V1}/me`, meRoutes);
// app.use(`${API_V1}/admin/modules`, tenantModuleRoutes);
// app.use(`${API_V1}/admin/settings`, tenantSettingsRoutes);
app.use(`${API_V1}/admin/permissions`, permissionRoutes);
app.use(`${API_V1}/admin/roles`, roleRoutes);
app.use(`${API_V1}/admin/users`, userRoutes);
app.use(`${API_V1}/admin/tenant`, tenantProfileRoutes);
app.use(`${API_V1}/admin/tenant-settings`, tenantSettingsRoutes);
app.use(`${API_V1}/admin/tenant/branding`, tenantBrandingRoutes);
app.use(`${API_V1}/admin/dashboard`, adminDashboardRoutes);
app.use(`${API_V1}/admin/sidebar`, adminSidebarRoutes);
// -----------------------------
// 404 Handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
