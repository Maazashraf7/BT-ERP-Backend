import express from "express";
import cors from "cors";

// ----------------------------
// 👑 Super Admin (Platform)

import superAdminAuthRoutes from "./modules/superadminpower/superadmin.routes.js";
import { loginTenant } from "./modules/admin/tenants/tenant.controller.js";



// 🏫 Tenant Admin
import tenantRouter from "./modules/tenant.routes.js";



// (Cleaned up individual imports)

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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

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
app.use(`${API_V1}/super-admin`, superAdminAuthRoutes); // Login/Management


app.post(`${API_V1}/auth/tenant/login`, loginTenant);
app.use(`${API_V1}/:tenantName`, tenantRouter);
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
