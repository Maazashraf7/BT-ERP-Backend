import prisma from "../../../core/config/db.js";
import logger from "../../../core/utils/logger.js";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";

/**
 * Create Platform Permission
 */
export const createPlatformPermission = async (req, res) => {
    try {
        const { key, name, description, domainId } = req.body;
        if (!key || !name) return res.status(400).json({ success: false, message: "Key and name required" });

        const upperKey = key.trim().toUpperCase();

        const existing = await prisma.platformPermission.findUnique({ where: { key: upperKey } });
        if (existing) return res.status(409).json({ success: false, message: "Permission key already exists" });

        const permission = await prisma.platformPermission.create({
            data: {
                key: upperKey,
                name,
                description,
                domains: (domainId && Array.isArray(domainId)) ? {
                    create: domainId.map(dId => ({ domainId: dId }))
                } : undefined
            },
            include: {
                domains: { include: { domain: true } }
            }
        });

        res.status(201).json({ success: true, permission });
    } catch (error) {
        logger.error("Create Platform Permission Error:", error);
        res.status(500).json({ success: false, message: "Failed to create platform permission" });
    }
};

/**
 * Update Platform Permission
 */
export const updatePlatformPermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { key, name, description, domainId } = req.body;

        const existing = await prisma.platformPermission.findUnique({
            where: { id },
            include: { domains: true }
        });
        if (!existing) return res.status(404).json({ success: false, message: "Platform permission not found" });

        const permission = await prisma.platformPermission.update({
            where: { id },
            data: {
                key,
                name,
                description,
                domains: (domainId && Array.isArray(domainId)) ? {
                    deleteMany: {},
                    create: domainId.map(dId => ({ domainId: dId }))
                } : undefined
            },
            include: {
                domains: { include: { domain: true } }
            }
        });

        res.json({ success: true, message: "Permission updated successfully", permission });
    } catch (error) {
        logger.error("Update Platform Permission Error:", error);
        res.status(500).json({ success: false, message: "Failed to update platform permission" });
    }
};

/**
 * List Platform Permissions
 */
export const listPlatformPermissions = async (req, res) => {
    try {
        const permissions = await prisma.platformPermission.findMany({
            include: {
                domains: {
                    include: { domain: true }
                }
            },
            orderBy: { key: "asc" }
        });
        res.json({ success: true, permissions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch platform permissions" });
    }
};

/**
 * Assign Permissions to Platform Role
 */
export const assignPermissionsToPlatformRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body; // Array of permission IDs
        const actorUserId = req.user.id;
        const actorType = req.user.type;

        if (!Array.isArray(permissions)) return res.status(400).json({ success: false, message: "Permissions must be an array" });

        const role = await prisma.platformRole.findUnique({ where: { id: roleId } });
        if (!role) return res.status(404).json({ success: false, message: "Platform role not found" });

        await prisma.$transaction([
            prisma.platformRolePermission.deleteMany({ where: { roleId } }),
            prisma.platformRolePermission.createMany({
                data: permissions.map(pId => ({ roleId, permissionId: pId }))
            })
        ]);

        await writeAuditLog({
            actorType: actorType === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PLATFORM_MANAGEMENT",
            [actorType === "SUPER_ADMIN" ? "superAdminId" : "platformManagementId"]: actorUserId,
            action: "PLATFORM_PERMISSIONS_ASSIGNED",
            entity: "PLATFORM_ROLE",
            entityId: roleId,
            meta: { permissionsCount: permissions.length },
            req,
        });

        res.json({ success: true, message: "Permissions assigned successfully" });
    } catch (error) {
        logger.error("Assign Platform Permissions Error:", error);
        res.status(500).json({ success: false, message: "Failed to assign permissions" });
    }
};

// --------------------------------------------------------------------------------
// Platform Permission Domains
// --------------------------------------------------------------------------------

export const createPlatformPermissionDomain = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name required" });

        const domain = await prisma.platformPermissionDomain.create({
            data: { name, description }
        });
        res.status(201).json({ success: true, domain });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create domain" });
    }
};

export const listPlatformPermissionDomains = async (req, res) => {
    try {
        const domains = await prisma.platformPermissionDomain.findMany({
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                key: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: { permissions: true }
                }
            },
            orderBy: { name: "asc" }
        });

        // Flatten the structure for a cleaner response
        const formattedDomains = domains.map(domain => ({
            ...domain,
            permissions: domain.permissions.map(p => p.permission)
        }));

        return res.status(200).json({
            success: true,
            data: formattedDomains
        });

    } catch (error) {
        console.error("List Domain Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updatePlatformPermissionDomain = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const domain = await prisma.platformPermissionDomain.update({
            where: { id },
            data: { name, description }
        });
        res.json({ success: true, domain });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update domain" });
    }
};

export const deletePlatformPermissionDomain = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if domain has permissions via mapping table
        const count = await prisma.platformPermissionDomainMap.count({
            where: {
                domainId: id
            }
        });

        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete domain that has permissions assigned to it"
            });
        }

        await prisma.platformPermissionDomain.delete({ where: { id } });
        res.json({ success: true, message: "Domain deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete domain" });
    }
};

