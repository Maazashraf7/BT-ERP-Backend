import { Router } from "express";
import {listGroupedPermissions  } from "./permission.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, listGroupedPermissions);


export default router;
