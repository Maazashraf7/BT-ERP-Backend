import express from "express";
import cors from "cors";

// Existing auth (tenant users / future use)
import tenantAuthRoutes from "./modules/auth/auth.routes.js";

// 🔐 Platform (Super Admin)
import platformAuthRoutes from "./platform/auth/auth.routes.js";
import tenantRoutes from "./platform/tenants/tenant.routes.js";
import meRoutes from "./modules/me/me.routes.js";
import platformDashboardRoutes from "./platform/dashboard/dashboard.routes.js";


const app = express();

// -----------------------------
// CORS Middleware
// -----------------------------
const origins = process.env.CORS_ORIGINS || "http://localhost:5174";
const corsOptions = {
  origin: origins.split(","),
  credentials: true,
};
app.use(cors(corsOptions));
// -----------------------------
// Global Middlewares
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Health Check
// -----------------------------
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "BT-ERP Backend Running 🚀" });
});

// -----------------------------
// Routes
// -----------------------------

// Tenant / User auth (future: tenant login)
app.use("/api/auth", tenantAuthRoutes);
app.use("/api/me", meRoutes);


// Platform-level routes (Super Admin)
app.use("/platform/auth", platformAuthRoutes);
app.use("/platform/tenants", tenantRoutes);
app.use("/platform/dashboard", platformDashboardRoutes);

// -----------------------------
// 404 Handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
