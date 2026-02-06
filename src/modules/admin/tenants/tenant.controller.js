import prisma from "../../../core/config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { writeAuditLog } from "../../../platform/audit/audit.helper.js";

/**
 * SUPER ADMIN
 * Create a new Tenant
 */
export const createTenant = async (req, res) => {
  try {
    const {
      tenantName,
      tenantType,
      tenantUsername,
      tenantPassword,
      tenantEmail,
      tenantPhone,
      tenantAddress,
      tenantWebsite,
      logoUrl,
      subscription_planId,
      faviconUrl,
      themeColor
    } = req.body;


    const superAdminId = req.user.id;


    const checkTenantphone = await prisma.tenant.findFirst({
      where: {
        tenantPhone
      }
    });
    const chekTenantEmail = await prisma.tenant.findFirst({
      where: {
        tenantEmail
      }
    });
    const chekTenantUsername = await prisma.tenant.findFirst({
      where: {
        tenantUsername
      }
    });
    const chekTenantName = await prisma.tenant.findFirst({
      where: {
        tenantName
      }
    });


    if (checkTenantphone || chekTenantEmail || chekTenantUsername || chekTenantName) {
      return res.status(400).json({
        success: false,
        message: "Tenant already exists with this phone number, email, username or name",
      });
    }

    if (!tenantName || !tenantType || !tenantUsername || !tenantPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (tenantName, tenantType, tenantUsername, tenantPassword)",
      });
    }

    const finalAdminEmail = tenantEmail;
    if (!finalAdminEmail) {
      return res.status(400).json({
        success: false,
        message: "Admin Email is required",
      });
    }

    const hashedPassword = await bcrypt.hash(tenantPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify Plan
      const plan = await tx.subscription_Plan.findUnique({
        where: { id: subscription_planId },
      });

      if (!plan) {
        throw new Error("Specified subscription plan not found or invalid");
      }


      // 2. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          tenantName,
          tenantType,
          tenantEmail,
          tenantUsername,
          tenantPassword: hashedPassword,
          tenantPhone,
          tenantAddress,
          tenantWebsite,
          logoUrl,
          faviconUrl,
          themeColor,
          subscription_planId: plan.id,
        },
      });

      await writeAuditLog({
        actorType: "SUPER_ADMIN",
        superAdminId,
        action: "TENANT_CREATED",
        entity: "TENANT",
        entityId: tenant.id,
        meta: { tenantName, tenantUsername, plan: plan.name },
        req,
      });

      return { tenant, planName: plan.name };
    });

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      tenant: result.tenant,
      plan: result.planName,
    });
  } catch (error) {
    console.error("CREATE TENANT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tenant",
    });
  }
};

/**
 * TENANT USER
 * Login to Tenant
 */
export const loginTenant = async (req, res) => {
  try {
    const { tenantUsername, password } = req.body;

    if (!tenantUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "tenantUsername and password are required"
      });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { tenantUsername }
    });

    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tenant is disabled"
      });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, tenant.tenantPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // JWT
    const token = jwt.sign(
      {
        tenantId: tenant.id,
        role: tenant.role,
        type: "TENANT",

      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Tenant login successful",
      token,
      tenant: {
        id: tenant.id,
        tenantName: tenant.tenantName,
        tenantUsername: tenant.tenantUsername,
        role: tenant.role || "SUPER_ADMIN",
        tenantEmail: tenant.tenantEmail,
        tenantPhone: tenant.tenantPhone,
        tenantAddress: tenant.tenantAddress,
        tenantWebsite: tenant.tenantWebsite,
        logoUrl: tenant.logoUrl,
        faviconUrl: tenant.faviconUrl,
        themeColor: tenant.themeColor,
        subscription_planId: tenant.subscription_planId,

      }
    });

  } catch (error) {
    console.error("TENANT LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

/**
 * SUPER ADMIN
 * Update Tenant Details
 */
export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const data = req.body;
    const superAdminId = req.user.id;


    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        tenantName: data.tenantName,
        tenantType: data.tenantType,
        tenantEmail: data.tenantEmail,
        tenantPhone: data.tenantPhone,
        tenantAddress: data.tenantAddress,
        tenantWebsite: data.tenantWebsite,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        themeColor: data.themeColor,
        subscription_planId: data.subscription_planId
      }
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_UPDATED",
      entity: "TENANT",
      entityId: tenant.id,
      req,
    });

    res.json({
      success: true,
      message: "Tenant updated successfully",
      tenant
    });

  } catch (error) {
    console.error("Update Tenant Error:", error);
    res.status(500).json({ success: false, message: "Failed to update tenant" });
  }
};

/**
 * SUPER ADMIN
 * Delete Tenant
 */
export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const superAdminId = req.user.id;

    const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    await prisma.tenant.delete({
      where: { id: tenantId }
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: "TENANT_DELETED",
      entity: "TENANT",
      entityId: tenantId,
      req,
    });

    res.json({ success: true, message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Delete Tenant Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete tenant" });
  }
};

/**
 * SUPER ADMIN
 * List all Tenants
 */
export const listTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        subscription_plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      tenants: tenants.map((t) => ({
        id: t.id,
        tenantName: t.tenantName,
        tenantType: t.tenantType,
        isActive: t.isActive,
        createdAt: t.createdAt,
        plan: t.subscription_plan?.name ?? "NONE",
      })),
    });
  } catch (error) {
    console.error("LIST TENANTS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tenants" });
  }
};

/**
 * SUPER ADMIN
 * Get Tenant Details
 */
export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription_plan: true,
        roles: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.json({
      success: true,
      tenant: {
        ...tenant,
        plan: tenant.subscription_plan?.name ?? "NONE",
      }
    });
  } catch (error) {
    console.error("GET TENANT DETAILS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tenant details" });
  }
};

/**
 * SUPER ADMIN
 * Toggle Tenant Status
 */
export const toggleTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;
    const superAdminId = req.user.id;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be boolean" });
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
    });

    await writeAuditLog({
      actorType: "SUPER_ADMIN",
      superAdminId,
      action: isActive ? "TENANT_ACTIVATED" : "TENANT_DEACTIVATED",
      entity: "TENANT",
      entityId: tenantId,
      req,
    });

    res.json({ success: true, message: isActive ? "Tenant activated" : "Tenant deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle status" });
  }
};
