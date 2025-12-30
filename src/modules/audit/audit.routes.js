import express from "express";
import {
	getMyAuditLogs,
//   getTenantAuditLogs,
  
} from "./audit.controller.js";

// import superAdminAuth from "../../middlewares/superAdmin.middleware.js";
// import tenantAuth from "../../middlewares/auth.middleware.js";
import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
const router = express.Router();


// // Tenant Admin
// router.get(
//   "/tenant/audit-logs",
//   requirePermission("AUDIT_VIEW"),
//   getTenantAuditLogs
// );

// Tenant User (self)
router.get(
  "/me/audit-logs",
  authMiddleware,
  getMyAuditLogs
);


export default router;





