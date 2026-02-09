import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./core/middlewares/auth.middleware.js";

// ----------------------------
// 👑 Super Admin (Platform)
import platformDashboardRoutes from "./platform/dashboard/dashboard.routes.js";
import platformAuditRoutes from "./platform/audit/audit.routes.js";
import modulesRoutes from "./platform/modules/module.routes.js";
import tenantsfeaturesRoutes from "./modules/admin/tenants/tenants_and_features/tenantsfeatures.route.js";


import superAdminAuthRoutes from "./modules/admin/platform/superadmin.routes.js";
import superAdminTenantRoutes from "./modules/admin/tenants/tenant.routes.js";
import Subscription_Plan from "./modules/admin/subscription/subscription.routes.js";
import { loginTenant } from "./modules/admin/tenants/tenant.controller.js";
import domainRoutes from "./modules/admin/feature_domain/feature_domain.route.js";
import levelPowerRoutes from "./modules/admin/levelpower/levelpower.routes.js";
import featureRoutes from "./modules/admin/Features/features.route.js";
import permissionRoutes from "./modules/admin/tenants/permissions/permission.routes.js";
import platformManagementRoutes from "./modules/admin/platform/staff.routes.js";
import platformRoleRoutes from "./modules/admin/platform/role.routes.js";
import platformPermissionRoutes from "./modules/admin/platform/permission.routes.js";
import featureDomainRoutes from "./modules/admin/feature_domain/feature_domain.route.js";

// 🏫 Tenant Admin
import tenantRouter from "./modules/admin/tenantaction/tenant.routes.js";



// (Cleaned up individual imports)

// -----------------------------
// App Init
// -----------------------------
const app = express();
// -----------------------------
// CORS
// -----------------------------
const origins = process.env.CORS_ORIGINS || "*";
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // If CORS_ORIGINS is '*', strictly speaking we can't use credentials: true with wildcard.
      // But for dev, we can reflect the origin.
      if (origins === "*") {
        return callback(null, true);
      }

      const allowedOrigins = origins.split(",");
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // For development convenience, you might want to allow all origins by reflecting them:
        // callback(null, true); 
        // But let's stick to the env var or reflect if it's localhost
        // If you are having trouble, un-comment the line below to allow ALL origins with credentials (dev only)
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// -----------------------------
// Global Middlewares
// -----------------------------
app.use(cookieParser());
app.use((req, res, next) => {
  console.log("🍪 COOKIES DEBUG:", req.cookies);
  // console.log("🔐 SIGNED COOKIES DEBUG:", req.signedCookies);
  next();
});
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

app.post("/test-body", (req, res) => {
  console.log("TEST BODY:", req.body);
  res.json({ body: req.body });
});

// =============================
// API v1 ROUTES
// =============================
const API_V1 = "/api/v1";






































































// -----------------------------
// 👑 SUPER ADMIN (PLATFORM)
// -----------------------------
app.use(`${API_V1}/super-admin/auth`, superAdminAuthRoutes); // Login/Management
app.use(`${API_V1}/super-admin/tenants`, superAdminTenantRoutes);
app.use(`${API_V1}/super-admin/subscription`, Subscription_Plan);
app.use(`${API_V1}/super-admin/features/domain`, featureDomainRoutes);
app.use(`${API_V1}/super-admin/features`, featureRoutes);
app.use(`${API_V1}/super-admin/permissions`, permissionRoutes); // Permissions CRUD
app.use(`${API_V1}/super-admin/tenant-features`, tenantsfeaturesRoutes);
app.use(`${API_V1}/super-admin/level-power`, levelPowerRoutes);



app.use(`${API_V1}/super-admin/dashboard`, platformDashboardRoutes);
app.use(`${API_V1}/audit-logs`, platformAuditRoutes);
app.use(`${API_V1}/super-admin/modules`, modulesRoutes);



// Global Tenant Login
app.post(`${API_V1}/auth/tenant/login`, loginTenant);

// Global Platform Management Staff Management (Global)
app.use(`${API_V1}/super-admin/platform-management`, platformManagementRoutes);
app.use(`${API_V1}/super-admin/platform-roles`, platformRoleRoutes);
app.use(`${API_V1}/super-admin/platform-permissions`, platformPermissionRoutes);

// Mounts all tenant functionality under /api/v1/:tenantName/
app.use(`${API_V1}/:tenantName`, tenantRouter);










// -----------------------------
// 🏫 TENANT AUTH & DYNAMIC ROUTES
// -----------------------------

// Global Auth Routes (Cookie-based)
app.get(`${API_V1}/auth/me`, authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

app.post(`${API_V1}/auth/logout`, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

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
