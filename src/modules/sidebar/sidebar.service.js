import { SIDEBAR_TREE } from "./sidebar.config.js";
import { isDomainAllowed } from "./sidebar.domain.js";

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

    // 2️⃣ Module check
    if (node.module && !enabledModules.includes(node.module)) {
      return null;
    }

    // 3️⃣ Permission check
    if (node.permission && !permissions.includes(node.permission)) {
      return null;
    }

    // 4️⃣ Children (recursive)
    if (node.children) {
      const children = node.children
        .map(filterNode)
        .filter(Boolean);

      if (children.length === 0) return null;

      return { ...node, children };
    }

    return node;
  };

  return SIDEBAR_TREE.map(filterNode).filter(Boolean);
};
