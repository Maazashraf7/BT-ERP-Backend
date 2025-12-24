export const getPlanHistory = async (req, res) => {
  try {
    const { planId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        entity: "PLAN",
        entityId: planId,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      history: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan history",
    });
  }
};
