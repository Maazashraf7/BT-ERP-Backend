import express from "express";
import * as controller from "./permission.controller.js";
import {requireSuperAdmin} from "../../core/middlewares/platformAuth.middleware.js";

const router = express.Router();

router.use(requireSuperAdmin);
router.post("/", controller.createPermission);
router.post("/bulk", controller.bulkCreatePermissions);

router.get("/", controller.listPermissions);
router.get("/grouped", controller.groupedPermissions);

router.patch("/:id", controller.updatePermission);
router.delete("/:id", controller.deletePermission);

export default router;
