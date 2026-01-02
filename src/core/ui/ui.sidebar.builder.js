import { PERMISSION_UI_MAP } from "./permission-ui.map.js";
import { SIDEBAR_GROUPS_BY_TENANT } from "./sidebar.groups.js";

const CORE_SIDEBAR_ITEMS = [
  {
    key: "DASHBOARD",
    label: "Dashboard",
    icon: "home",
    route: "/dashboard",
    order: 0,
  },

];

export const buildSidebar = ({ permissions, tenantType, enabledModules }) => {
  const GROUPS = SIDEBAR_GROUPS_BY_TENANT[tenantType] || {};
  const groups = {};
  const roots = [...CORE_SIDEBAR_ITEMS];

  const getGroup = (key) => {
    if (!groups[key]) groups[key] = { ...GROUPS[key], children: [] };
    return groups[key];
  };

  permissions.forEach((perm) => {
    const cfg = PERMISSION_UI_MAP[perm]?.sidebar;
    if (!cfg) return;
    if (cfg.module && !enabledModules.includes(cfg.module)) return;

    const parentKey =
      typeof cfg.parentKey === "object"
        ? cfg.parentKey[tenantType]
        : cfg.parentKey;

    if (parentKey) getGroup(parentKey).children.push(cfg);
    else roots.push(cfg);
  });

  Object.values(groups).forEach((g) => {
    if (g.parentKey) getGroup(g.parentKey).children.push(g);
  });

  const sort = (arr) =>
    arr
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .map((i) =>
        i.children ? { ...i, children: sort(i.children) } : i
      );

  return sort([
    ...roots,
    ...Object.values(groups).filter((g) => !g.parentKey),
  ]);
};
