import prisma from "../config/db.js";

/**
 * Usage:
 * requireModule("students")
 * requireModule("attendance")
 */
export const requireModule = (moduleKey) => {
  return async (req, res, next) => {
    try {
      const { tenantId } = req.user;

      // Check if module is enabled for tenant via subscription plan
      const moduleAccess = await prisma.subscription.findFirst({
        where: {
          tenantId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
          plan: {
            modules: {
              some: {
                module: {
                  key: moduleKey,
                },
              },
            },
          },
        },
      });

      if (!moduleAccess) {
        return res.status(403).json({
          success: false,
          message: `Module "${moduleKey}" is not available in your plan`,
        });
      }

      next();
    } catch (error) {
      console.error("Module guard error:", error);
      res.status(500).json({
        success: false,
        message: "Module access validation failed",
      });
    }
  };
};
