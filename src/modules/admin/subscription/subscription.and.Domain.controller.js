import prisma from "../../../core/config/db.js";


/**
 * Assign Domain (TenantFeatureDomain) to Subscription Plan
 */
export const assignDomainToSubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        let { planId, domainId } = req.body;

        planId = planId?.trim();
        domainId = domainId?.trim();

        if (!planId || !domainId) {
            return res.status(400).json({ success: false, message: "planId and domainId required" });
        }

        const domain = await prisma.tenantFeatureDomain.findUnique({
            where: { id: domainId },
        });

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: `Domain not found with ID: ${domainId}`,
            });
        }

        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: `Plan not found with ID: ${planId}`,
            });
        }

        // Check relation
        const existingData = await prisma.subscription_Plan_Domain.findUnique({
            where: {
                subscription_planId_domainId: {
                    subscription_planId: planId,
                    domainId,
                },
            },
        });

        if (existingData) {
            return res.status(400).json({
                success: false,
                message: "Domain already assigned to this plan",
            });
        }

        const planDomain = await prisma.subscription_Plan_Domain.create({
            data: {
                subscription_planId: planId,
                subscription_plan_name: plan.name,
                domainId,
                domain_name: domain.domain_name,
            },
        });

        res.json({
            success: true,
            message: "Domain assigned to plan successfully",
            planDomain,
        });
    } catch (error) {
        console.error("ASSIGN DOMAIN TO PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to assign domain to plan" });
    }
};


/**
 * Remove Domain from Subscription Plan
 */
export const removeDomainFromSubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { planId, domainId } = req.body;

        if (!planId || !domainId) {
            return res.status(400).json({ success: false, message: "planId and domainId required" });
        }

        const domainRecord = await prisma.subscription_Plan_Domain.findUnique({
            where: {
                subscription_planId_domainId: {
                    subscription_planId: planId,
                    domainId,
                },
            },
        });

        if (!domainRecord) {
            return res.status(404).json({ success: false, message: "Domain not assigned to this plan" });
        }

        await prisma.subscription_Plan_Domain.delete({
            where: {
                subscription_planId_domainId: {
                    subscription_planId: planId,
                    domainId,
                },
            },
        });

        res.json({
            success: true,
            message: "Domain removed from plan successfully",
        });
    } catch (error) {
        console.error("REMOVE DOMAIN FROM PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to remove domain from plan" });
    }
};


/**
 * Get All Domains in a Subscription Plan
 */
export const getAllDomainsInSubscription = async (req, res) => {
    try {
        const { planId } = req.query; // Use query param for GET

        if (!planId) {
            return res.status(400).json({ success: false, message: "planId is required as a query parameter" });
        }

        // Check if plan exists
        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Subscription Plan not found",
            });
        }

        const domainsRaw = await prisma.subscription_Plan_Domain.findMany({
            where: { subscription_planId: planId },
            include: {
                domain: {
                    include: {
                        features: {
                            include: { feature: true }
                        }
                    }
                }
            }
        });

        // Flatten the data for a cleaner response
        const flattenedDomains = domainsRaw.map(planDomain => {
            const domainInfo = planDomain.domain;
            return {
                domainId: planDomain.domainId,
                domain_name: planDomain.domain_name,
                isActive: planDomain.isActive,
                details: {
                    price: domainInfo?.price,
                    description: domainInfo?.description,
                },
                features: domainInfo?.features.map(f => ({
                    featureId: f.featureId,
                    feature_name: f.feature_name,
                    feature_code: f.feature.feature_code,
                    description: f.feature.description,
                    isActive: f.feature.isActive
                })) || []
            };
        });

        res.json({
            success: true,
            message: "Domains and features in plan fetched successfully",
            count: flattenedDomains.length,
            domains: flattenedDomains,
        });
    } catch (error) {
        console.error("GET DOMAINS AND FEATURES IN PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to get domains and features in plan" });
    }
};


