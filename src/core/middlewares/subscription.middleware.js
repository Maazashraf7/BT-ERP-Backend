import prisma from "../config/db.js";

export const requireActiveSubscription = async (req, res, next) => {
  const { tenantId } = req.user;

  const sub = await prisma.subscription.findFirst({
    where: {
      tenantId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  if (!sub) {
    return res.status(403).json({
      message: "Subscription expired. Please upgrade your plan.",
    });
  }

  next();
};
