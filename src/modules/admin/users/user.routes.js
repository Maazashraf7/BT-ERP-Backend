import { Router } from "express";
import { createUser , getUsers, updateUserByAdmin, deleteUser, bulkCreateUsers,restoreUser, toggleUserStatus, getUserDetails, listUsers, updateMyProfile } from "./user.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/require.permission.js";



const router = Router();

router.post("/create", authMiddleware, createUser);
router.get("/", authMiddleware, getUsers);
router.get("/details/:userId", authMiddleware, getUserDetails);
router.get("/list", authMiddleware,listUsers);
router.put("/update/:userId", authMiddleware, updateUserByAdmin);
router.delete("/delete/:userId", authMiddleware, deleteUser);
router.post("/bulk-create", authMiddleware, bulkCreateUsers);
router.put("/toggle-status/:userId", authMiddleware, toggleUserStatus);
router.put("/restore/:userId", authMiddleware, restoreUser);
router.delete("/delete/:userId", authMiddleware, deleteUser);
router.put("/update-my-profile", authMiddleware, updateMyProfile);


export default router;
