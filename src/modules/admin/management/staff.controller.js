import prisma from "../../../core/config/db.js";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";
import { AUDIT_ACTIONS } from "../../../platform/audit/audit.constants.js";
import logger from "../../../core/utils/logger.js";

/**
 * TENANT ADMIN
 * Register Management Staff
 */
export const registerManagementStaff = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const tenantId = req.user.tenantId;
        const actorUserId = req.user.id;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const existing = await prisma.managementStaff.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await prisma.managementStaff.create({
            data: {
                email,
                password: hashedPassword,
                name,
                tenantId,
            },
        });

        await writeAuditLog({
            actorType: "TENANT_USER",
            userId: actorUserId,
            tenantId,
            action: "STAFF_CREATED",
            entity: "MANAGEMENT_STAFF",
            entityId: staff.id,
            meta: { name: staff.name, email: staff.email },
            req,
        });

        res.status(201).json({
            success: true,
            message: "Management Staff created successfully",
            staff: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (error) {
        logger.error("Register Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to create staff" });
    }
};

/**
 * TENANT ADMIN
 * List Management Staff
 */
export const listManagementStaff = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const staff = await prisma.managementStaff.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            staff,
        });
    } catch (error) {
        logger.error("List Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch staff" });
    }
};

/**
 * TENANT ADMIN
 * Update Management Staff
 */
export const updateManagementStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive, password } = req.body;
        const tenantId = req.user.tenantId;
        const actorUserId = req.user.id;

        const staff = await prisma.managementStaff.findFirst({
            where: { id, tenantId }
        });

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedStaff = await prisma.managementStaff.update({
            where: { id },
            data: updateData
        });

        await writeAuditLog({
            actorType: "TENANT_USER",
            userId: actorUserId,
            tenantId,
            action: "STAFF_UPDATED",
            entity: "MANAGEMENT_STAFF",
            entityId: id,
            meta: { updates: Object.keys(updateData) },
            req,
        });

        res.json({ success: true, message: "Staff updated", staff: updatedStaff });

    } catch (error) {
        logger.error("Update Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to update staff" });
    }
}


/**
 * TENANT ADMIN
 * Delete Management Staff
 */
export const deleteManagementStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        const actorUserId = req.user.id;

        const staff = await prisma.managementStaff.findFirst({
            where: { id, tenantId }
        });

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        await prisma.managementStaff.delete({
            where: { id }
        });

        await writeAuditLog({
            actorType: "TENANT_USER",
            userId: actorUserId,
            tenantId,
            action: "STAFF_DELETED",
            entity: "MANAGEMENT_STAFF",
            entityId: id,
            req,
        });

        res.json({ success: true, message: "Staff deleted successfully" });

    } catch (error) {
        logger.error("Delete Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete staff" });
    }
}
