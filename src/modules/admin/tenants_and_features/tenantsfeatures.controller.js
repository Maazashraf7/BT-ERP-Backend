import prisma from "../../../core/config/db.js";


export const assignFeatureToTenant = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { tenantId, featureId } = req.body;

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found",
            });
        }

        const feature = await prisma.feature.findUnique({
            where: { id: featureId },
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const tenantFeature = await prisma.tenantsfeatures.create({
            data: {
                tenantId,
                featureId,
                feature_name: feature.feature_name,
                tenant_name: tenant.tenantName,
                feature_description: feature.description || "",
                tenant_description: tenant.tenantName, // Using tenantName as description for now as Tenant model has no description
            },
        });

        res.json({
            success: true,
            message: "Feature assigned to tenant successfully",
            tenantFeature,
        });
    } catch (error) {
        console.error("ASSIGN FEATURE TO TENANT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to assign feature to tenant" });
    }
};


export const getTeanantsAssignedFeaturesByTenantId = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const tenantFeatures = await prisma.tenantsfeatures.findMany({
            where: { tenantId },
            include: {
                tenant: true,
                feature: true,
            },
        });
        res.json({
            success: true,
            message: "Tenant features fetched successfully",
            tenantFeatures,
        });
    } catch (error) {
        console.error("GET TENANT FEATURES ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to get tenant features" });
    }
};


export const removeFeatureFromTenant = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { tenantId, featureId } = req.body;

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found",
            });
        }

        const feature = await prisma.feature.findUnique({
            where: { id: featureId },
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const tenantFeature = await prisma.tenantsfeatures.delete({
            where: {
                tenantId_featureId: {
                    tenantId,
                    featureId,
                },
            },
        });

        res.json({
            success: true,
            message: "Feature removed from tenant successfully",
            tenantFeature,
        });
    } catch (error) {
        console.error("REMOVE FEATURE FROM TENANT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to remove feature from tenant" });
    }
};
