export const DOMAIN_TENANT_MAP = {
  COMMON: ["ALL"],
  EDUCATION: ["SCHOOL", "COACHING"],
  HEALTHCARE: ["CLINIC", "SALON", "GYM"],
  COMMERCE: ["RETAIL", "PHARMACY"],
  HOSPITALITY: ["RESTAURANT"],
};

export const isDomainAllowed = (domain, tenantType) => {
  if (!domain) return true;

  const allowed = DOMAIN_TENANT_MAP[domain];
  if (!allowed) return false;

  return allowed.includes("ALL") || allowed.includes(tenantType);
};
