import prisma from "../config/db.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const { tenantId } = req.user;

    // Super Admin bypass (no tenant)
    if (!tenantId) {
      return next();
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        endDate: true,
        plan: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message: "Your subscription has expired. Please renew to continue.",
      });
    }

    // Attach to request for downstream use
    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("SUBSCRIPTION MIDDLEWARE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Subscription validation failed",
    });
  }
};
