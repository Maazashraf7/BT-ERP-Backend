import { Router } from "express";
import {
    createClass,
    listClasses,
    getClassDetails,
    updateClass,
    deleteClass,
    getExamsByClass,
} from "./class.controller.js";
import { requirePermission } from "../../../../../core/middlewares/permission.middleware.js";
import { checkDomainInPlan } from "../../../../../core/middlewares/fetures.middleware.js";

const router = Router();

// Domain restriction
router.use(checkDomainInPlan("CLASSES"));

// 🏫 Class CRUD
router.post("/", requirePermission("CREATE_CLASS"), createClass);
router.get("/", requirePermission("VIEW_CLASS"), listClasses);
router.get("/:id", requirePermission("VIEW_CLASS"), getClassDetails);
router.put("/:id", requirePermission("UPDATE_CLASS"), updateClass);
router.delete("/:id", requirePermission("DELETE_CLASS"), deleteClass);

// 📝 Get Exams by Class
router.get("/:id/exams", requirePermission("VIEW_CLASS"), getExamsByClass);

export default router;
