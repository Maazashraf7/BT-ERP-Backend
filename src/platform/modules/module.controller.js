import prisma from "../../core/config/db.js";
import { AUDIT_ACTIONS } from "../audit/audit.constants.js";
import { createAuditLog } from "../audit/audit.service.js";

/**
 * 👑 SUPER ADMIN
 * Create a new module
 */
export const createModule = async (req, res) => {
  try {
    const { key, name, isCommon = false, tenantTypes = [] } = req.body;

    if (!key || !name) {
      return res.status(400).json({
        success: false,
        message: "Module key and name are required",
      });
    }

    const module = await prisma.$transaction(async (tx) => {
      const createdModule = await tx.module.create({
        data: { key, name, isCommon },
      });

      if (!isCommon && tenantTypes.length > 0) {
        await tx.moduleTenantType.createMany({
          data: tenantTypes.map((type) => ({
            moduleId: createdModule.id,
            tenantType: type,
          })),
        });

        // 🔍 Audit tenant-type mapping
        await createAuditLog({
          actorType: "SUPER_ADMIN",
          action: AUDIT_ACTIONS.MODULE_ASSIGNED_TENANT_TYPE,
          entity: "MODULE",
          entityId: createdModule.id,
          meta: { tenantTypes },
          req,
        });
      }

      // 🔍 Audit module creation
      await createAuditLog({
        actorType: "SUPER_ADMIN",
        action: AUDIT_ACTIONS.MODULE_CREATED,
        entity: "MODULE",
        entityId: createdModule.id,
        meta: { key, name, isCommon },
        req,
      });

      return createdModule;
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    console.error("CREATE MODULE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create module",
    });
  }
};

/**
 * 👑 SUPER ADMIN
 * Enable / Disable module for a tenant
 */
export const toggleTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
    });

    res.json({
      success: true,
      tenant,
      message: isActive
        ? "Tenant activated successfully"
        : "Tenant deactivated successfully",
    });
  } catch (error) {
    console.error("TOGGLE TENANT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tenant status",
    });
  }
};


/**
 * 👑 SUPER ADMIN
 * Get enabled modules for a tenant
 */
export const getTenantModules = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const modules = await prisma.tenantModule.findMany({
      where: { tenantId },
      include: {
        module: true,
      },
    });

    res.json({
      success: true,
      modules: modules.map((tm) => ({
        id: tm.module.id,
        key: tm.module.key,
        name: tm.module.name,
        enabled: tm.enabled,
      })),
    });
  } catch (error) {
    console.error("GET TENANT MODULES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant modules",
    });
  }
};

/**
 * 👑 SUPER ADMIN
 * List all modules (optional tenantType filter)
 */
export const listModules = async (req, res) => {
  try {
    const { tenantType } = req.query;

    const where = tenantType
      ? {
          OR: [
            { isCommon: true },
            {
              tenantTypes: {
                some: { tenantType },
              },
            },
          ],
        }
      : {};

    const modules = await prisma.module.findMany({
      where,
      include: {
        tenantTypes: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      modules,
    });
  } catch (error) {
    console.error("LIST MODULES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
    });
  }
};