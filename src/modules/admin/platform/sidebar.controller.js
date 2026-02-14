import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";

/**
 * Create Platform Sidebar Item
 */
export const createSidebar = async (req, res) => {
    try {
        const { name } = req.body;

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const actorUserId = req.user.id;
        const actorType = req.user.type; // "SUPER_ADMIN" or "PLATFORM_MANAGEMENT"

        if (!name) {
            return res.status(400).json({ success: false, message: "Sidebar name is required" });
        }

        const existing = await prisma.platformSidebar.findFirst({
            where: { name: { equals: name, mode: "insensitive" } }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Sidebar item already exists" });
        }

        const sidebar = await prisma.platformSidebar.create({
            data: { name }
        });

        await writeAuditLog({
            actorType: actorType === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PLATFORM_MANAGEMENT",
            [actorType === "SUPER_ADMIN" ? "superAdminId" : "platformManagementId"]: actorUserId,
            action: "PLATFORM_SIDEBAR_CREATED",
            entity: "PLATFORM_SIDEBAR",
            entityId: sidebar.id,
            meta: { name },
            req
        });

        res.status(201).json({ success: true, sidebar });

    } catch (error) {
        logger.error(`[createSidebar] error: ${error.message}`, error);
        res.status(500).json({
            success: false,
            message: "Failed to create sidebar item",
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * List All Platform Sidebar Items
 */
export const listSidebars = async (req, res) => {
    try {
        const sidebars = await prisma.platformSidebar.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, sidebars });
    } catch (error) {
        logger.error(`[listSidebars] error: ${error.message}`, error);
        res.status(500).json({ success: false, message: "Failed to list sidebar items" });
    }
};

/**
 * Assign Sidebar Items to a Platform Role
 * Body: { roleId, sidebarIds: [] }
 */
export const assignSidebarToRole = async (req, res) => {
    try {
        const { roleId, sidebarIds } = req.body;
        const actorUserId = req.user.id;
        const actorType = req.user.type;

        if (!roleId || !Array.isArray(sidebarIds)) {
            return res.status(400).json({ success: false, message: "roleId and sidebarIds (array) are required" });
        }

        // Validate Role
        const role = await prisma.platformRole.findUnique({
            where: { id: roleId }
        });
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        // Validate Sidebars (Optional but good)
        if (sidebarIds.length > 0) {
            const count = await prisma.platformSidebar.count({
                where: { id: { in: sidebarIds } }
            });
            if (count !== sidebarIds.length) {
                return res.status(400).json({ success: false, message: "One or more sidebar IDs are invalid" });
            }
        }

        // Transaction to replace assignments
        await prisma.$transaction(async (tx) => {
            // Delete existing assignments for this role
            await tx.plaformsidebarassign_to_role.deleteMany({
                where: { roleId }
            });

            // Create new assignments
            if (sidebarIds.length > 0) {
                await tx.plaformsidebarassign_to_role.createMany({
                    data: sidebarIds.map((sid) => ({
                        roleId,
                        platformSidebarId: sid
                    }))
                });
            }
        });

        await writeAuditLog({
            actorType: actorType === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PLATFORM_MANAGEMENT",
            [actorType === "SUPER_ADMIN" ? "superAdminId" : "platformManagementId"]: actorUserId,
            action: "PLATFORM_SIDEBAR_ASSIGNED",
            entity: "PLATFORM_ROLE",
            entityId: roleId,
            meta: { sidebarIds },
            req
        });

        res.json({ success: true, message: "Sidebar items assigned successfully" });

    } catch (error) {
        logger.error(`[assignSidebarToRole] error: ${error.message}`, error);
        res.status(500).json({ success: false, message: "Failed to assign sidebar items" });
    }
};

/**
 * Get Sidebar Items Assigned to a Role
 */
export const getRoleSidebars = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await prisma.platformRole.findUnique({
            where: { id: roleId }
        });
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        // Start with finding the assignments
        const assignments = await prisma.plaformsidebarassign_to_role.findMany({
            where: { roleId },
            select: { platformSidebarId: true } // We only have the ID, no relation setup in schema shown
        });

        const sidebarIds = assignments.map(a => a.platformSidebarId);

        let sidebars = [];
        if (sidebarIds.length > 0) {
            sidebars = await prisma.platformSidebar.findMany({
                where: { id: { in: sidebarIds } }
            });
        }

        res.json({ success: true, sidebars });

    } catch (error) {
        logger.error(`[getRoleSidebars] error: ${error.message}`, error);
        res.status(500).json({ success: false, message: "Failed to fetch role sidebars" });
    }
};
