import { Router } from "express";
import { upload } from "../../../core/middlewares/upload.middleware.js";
import { uploadBranding } from "./branding.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadBranding
);

export default router;
