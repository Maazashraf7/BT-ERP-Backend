import { Router } from "express";
import { getMyUI } from "./me.controller.js";

const router = Router();

router.get("/config", getMyUI);

export default router;
