export const comparePlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        modules: {
          include: { module: true },
        },
      },
      orderBy: { price: "asc" },
    });

    const response = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      modules: plan.modules.map((pm) => ({
        key: pm.module.key,
        name: pm.module.name,
      })),
    }));

    res.json({
      success: true,
      plans: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load plans",
    });
  }
};
