import prisma from "../../../core/config/db.js";



export const assignFeatureToSubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        let { planId, featureId } = req.body;

        planId = planId?.trim();
        featureId = featureId?.trim();

        console.log(`ASSIGN FEATURE TO PLAN DEBUG - planId: '${planId}'`);
        console.log(`ASSIGN FEATURE TO PLAN DEBUG - featureId: '${featureId}'`);

        const feature = await prisma.feature.findUnique({
            where: { id: featureId },
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: `Feature not found with ID: ${featureId}`,
            });
        }

        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: `Plan not found with ID: ${planId} (Make sure the ID is correct)`,
            });
        }

        const featurePlan = await prisma.subscription_Plan_Feature.create({
            data: {
                subscription_planId: planId,
                subscription_plan_name: plan.name,
                featureId,
                feature_name: feature.feature_name,
            },
        });

        res.json({
            success: true,
            message: "Feature assigned to plan successfully",
            featurePlan,
        });
    } catch (error) {
        console.error("ASSIGN FEATURE TO PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to assign feature to plan" });
    }
};


export const removeFeatureFromSubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { planId, featureId } = req.body;

        const feature = await prisma.feature.findUnique({
            where: { id: featureId },
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found",
            });
        }

        const featurePlan = await prisma.subscription_Plan_Feature.delete({
            where: {
                subscription_planId_featureId: {
                    subscription_planId: planId,
                    featureId,
                },
            },
        });

        res.json({
            success: true,
            message: "Feature removed from plan successfully",
            featurePlan,
        });
    } catch (error) {
        console.error("REMOVE FEATURE FROM PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to remove feature from plan" });
    }
};


export const updateFeatureInSubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { planId, featureId, isActive } = req.body;

        const feature = await prisma.feature.findUnique({
            where: { id: featureId },
        });

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: "Feature not found",
            });
        }

        const plan = await prisma.subscription_Plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found",
            });
        }

        const featurePlan = await prisma.subscription_Plan_Feature.update({
            where: {
                subscription_planId_featureId: {
                    subscription_planId: planId,
                    featureId,
                },
            },
            data: {
                isActive,
            },
        });

        res.json({
            success: true,
            message: "Feature updated in plan successfully",
            featurePlan,
        });
    } catch (error) {
        console.error("UPDATE FEATURE IN PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update feature in plan" });
    }
};

export const getAllFeaturesInASubscription = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "Request body missing" });
        const { planId } = req.body;

        const availableFeaturesInPlan = await prisma.subscription_Plan_Feature.findMany({
            where: { subscription_planId: planId },
        });

        if (!availableFeaturesInPlan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found",
            });
        }

        res.json({
            success: true,
            message: "Features in plan fetched successfully",
            availableFeaturesInPlan,
        });
    } catch (error) {
        console.error("GET FEATURES IN PLAN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to get features in plan" });
    }
};


