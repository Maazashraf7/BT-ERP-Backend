const subscription = await prisma.subscription.findFirst({
  where: {
    tenantId,
    status: "ACTIVE",
  },
  include: {
    plan: {
      include: {
        modules: {
          include: {
            module: true,
          },
        },
      },
    },
  },
});
