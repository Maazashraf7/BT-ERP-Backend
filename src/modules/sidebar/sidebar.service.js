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

    // 2️⃣ Children (recursive) — evaluate children first so parent
    // can be shown when any child is allowed even if parent.module
    // is not explicitly enabled.
    if (node.children) {
      const children = node.children
        .map(filterNode)
        .filter(Boolean);

      if (children.length > 0) {
        return { ...node, children };
      }
      // if no children survived, continue to evaluate this node itself
    }

    // 3️⃣ Module check (case-insensitive)
    if (node.module && !enabledModules.includes(node.module.toUpperCase())) {
      return null;
    }

    // 4️⃣ Permission check
    if (node.permission && !permissions.includes(node.permission)) {
      return null;
    }

    return node;
  };

  return SIDEBAR_TREE.map(filterNode).filter(Boolean);
};
