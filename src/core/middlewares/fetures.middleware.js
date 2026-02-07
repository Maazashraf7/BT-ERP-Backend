import prisma from "../config/db.js";

export const checkFeatureInPlan = (featureName) => {
  return async (req, res, next) => {
    try {
      const { tenantId } = req.user;
      const role = req.user.role;
      const type = req.user.type;

      if (role === "SUPER_ADMIN" && type === "SUPER_ADMIN") {
        return next();
      }

      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: "Tenant context missing",
        });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          subscription_plan: true, // relation, not ID
        },
      });

      if (!tenant || !tenant.isActive || !tenant.subscription_plan) {
        return res.status(403).json({
          success: false,
          message: "Active subscription plan required",
        });
      }

      const feature = await prisma.feature.findUnique({
        where: { feature_name: featureName },
      });

      if (!feature) {
        return res.status(403).json({
          success: false,
          message: `Feature "${featureName}" not configured`,
        });
      }

      const featureInPlan =
        await prisma.Subscription_PlanFeature.findUnique({
          where: {
            subscription_planId_featureId: {
              subscription_planId: tenant.subscription_plan.id,
              featureId: feature.id,
            },
          },
        });

      if (!featureInPlan) {
        return res.status(403).json({
          success: false,
          message: `${featureName} not available in your subscription plan`,
        });
      }

      next();
    } catch (error) {
      console.error("Feature guard error:", error);
      res.status(500).json({
        success: false,
        message: "Feature access validation failed",
      });
    }
  };
};
