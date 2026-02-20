import { Router } from "express";
import {
    createStudent,
    listStudents,
    getStudentDetails,
    updateStudent,
    deleteStudent
} from "./student.controller.js";
import { checkDomainInPlan } from "../../../../../core/middlewares/fetures.middleware.js";
import { requirePermission } from "../../../../../core/middlewares/permission.middleware.js";
import { checkSubscription } from "../../../../../core/middlewares/subscription.middleware.js";
import { upload } from "../../../../../core/middlewares/upload.middleware.js";

const router = Router();

// Routes are already protected by tenantRouter middleware (authMiddleware and checkSubscription)
router.use(checkDomainInPlan("ACADEMIC"))
router.use(checkSubscription)

router.post("/", requirePermission("CREATE_STUDENT"), upload.single("studentImage"), createStudent);
router.get("/", requirePermission("READ_STUDENT"), listStudents);
router.get("/:id", requirePermission("READ_STUDENT"), getStudentDetails);
router.put("/:id", requirePermission("UPDATE_STUDENT"), upload.single("studentImage"), updateStudent);
router.delete("/:id", requirePermission("DELETE_STUDENT"), deleteStudent);

export default router;