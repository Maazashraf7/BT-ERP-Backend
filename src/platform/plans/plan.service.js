/**
 * Sync tenant modules from plan
 * - Enables modules in plan
 * - Disables modules not in plan (safe)
 */
export const syncTenantModulesFromPlan = async (tx, tenantId, planId) => {
  const planModules = await tx.planModule.findMany({
    where: { planId },
    include: { module: true },
  });

  const planModuleIds = planModules.map((pm) => pm.moduleId);

  // Enable modules in plan
  for (const pm of planModules) {
    await tx.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId,
          moduleId: pm.moduleId,
        },
      },
      update: { enabled: true },
      create: {
        tenantId,
        moduleId: pm.moduleId,
        enabled: true,
      },
    });
  }

  // Disable modules NOT in plan
  await tx.tenantModule.updateMany({
    where: {
      tenantId,
      moduleId: { notIn: planModuleIds },
    },
    data: { enabled: false },
  });
};
