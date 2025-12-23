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

// 🏫 Tenant Admin
import meRoutes from "./modules/me/me.routes.js";
// import tenantModuleRoutes from "./modules/modules/module.routes.js";
// import tenantSettingsRoutes from "./modules/settings/settings.routes.js";

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

// -----------------------------
// 👑 SUPER ADMIN (PLATFORM)
// -----------------------------
app.use(`${API_V1}/super-admin/tenants`, tenantRoutes);
app.use(`${API_V1}/super-admin/dashboard`, platformDashboardRoutes);
app.use(`${API_V1}/super-admin/audit-logs`, platformAuditRoutes);
app.use(`${API_V1}/super-admin/modules`, modulesRoutes);

// -----------------------------
// 🏫 TENANT ADMIN
// -----------------------------
app.use(`${API_V1}/me`, meRoutes);
// app.use(`${API_V1}/admin/modules`, tenantModuleRoutes);
// app.use(`${API_V1}/admin/settings`, tenantSettingsRoutes);

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
