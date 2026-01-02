export const RESTAURANT_SETTINGS_UI = {
  ROLES_VIEW: {
    sidebar: {
      key: "ROLES",
      label: "Roles",
      icon: "shield",
      route: "/admin/roles",
      module: "RESTAURANT_SETTINGS",
      parentKey: { RESTAURANT: "SECURITY" },
      order: 10,
    },
  },

  PERMISSIONS_VIEW: {
    sidebar: {
      key: "PERMISSIONS",
      label: "Permissions",
      icon: "key",
      route: "/admin/permissions",
      module: "RESTAURANT_SETTINGS",
      parentKey: { RESTAURANT: "SECURITY" },
      order: 20,
    },
  },
};
