import { Router } from "express";
import {
    markAttendance,
    bulkMarkAttendance,
    getAttendanceReport,
    deleteAttendance
} from "./attendence.controller.js";
import { requirePermission } from "../../../../../core/middlewares/permission.middleware.js";
import { checkDomainInPlan } from "../../../../../core/middlewares/fetures.middleware.js";

const router = Router();

// Domain restriction
router.use(checkDomainInPlan("ACADEMIC"));

// 📝 Marking Attendance
router.post("/", requirePermission("MARK_ATTENDANCE"), markAttendance);
router.post("/bulk", requirePermission("MARK_ATTENDANCE"), bulkMarkAttendance);

// 📝 Reports
router.get("/report", requirePermission("VIEW_ATTENDANCE_REPORT"), getAttendanceReport);

// 📝 Management (Admin/SuperAdmin)
router.delete("/:id", requirePermission("DELETE_ATTENDANCE"), deleteAttendance);

export default router;
