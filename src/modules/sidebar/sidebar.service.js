import { SIDEBAR_TREE } from "./sidebar.config.js";
import { isDomainAllowed } from "./sidebar.domain.js";

const CORE_MODULES = [
  "DASHBOARD",
  "USERS",
  "ROLES",
  "SETTINGS",
  "AUDIT_LOGS",
  "TENANT_PROFILE",
  "BRANDING",
  "PERMISSIONS",
  "SIDEBAR",
];

export const buildSidebar = ({
  tenantType,
  enabledModules,
  permissions,
}) => {
  const filterNode = (node) => {

    // 1️⃣ Domain check
    if (node.domain && !isDomainAllowed(node.domain, tenantType)) {
      return null;
    }

    // 2️⃣ Children first (important)
    if (node.children) {
      const children = node.children
        .map(filterNode)
        .filter(Boolean);

      if (children.length > 0) {
        return { ...node, children };
      }
    }

    // 3️⃣ Module visibility check
    if (
      node.module &&
      !CORE_MODULES.includes(node.module) &&
      !enabledModules.includes(node.module)
    ) {
      return null;
    }

    // 4️⃣ Permission check
    if (
      node.permission &&
      Array.isArray(permissions) &&
      permissions.length > 0 &&
      !permissions.includes(node.permission)
    ) {
      return null;
    }

    return node;
  };

  return SIDEBAR_TREE.map(filterNode).filter(Boolean);
};
