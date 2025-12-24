export const syncTenantModulesFromPlan = async (
  tx,
  tenantId,
  planId,
  strict = false
) => {
  const planModules = await tx.planModule.findMany({
    where: { planId },
  });

  const planModuleIds = planModules.map((pm) => pm.moduleId);

  // Enable modules in plan
  for (const moduleId of planModuleIds) {
    await tx.tenantModule.upsert({
      where: {
        tenantId_moduleId: { tenantId, moduleId },
      },
      update: { enabled: true },
      create: { tenantId, moduleId, enabled: true },
    });
  }

  // Disable removed modules ONLY in STRICT mode
  if (strict) {
    await tx.tenantModule.updateMany({
      where: {
        tenantId,
        moduleId: { notIn: planModuleIds },
      },
      data: { enabled: false },
    });
  }
};
