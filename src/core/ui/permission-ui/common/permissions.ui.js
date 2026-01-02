export const COMMON_PERMISSIONS_UI = {
  "permission.view": {
    sidebar: {
      key: "PERMISSIONS",
      label: "Permissions",
      icon: "key",
      route: "/admin/permissions",
      module: "USERS",
      parentKey: {
        SCHOOL: "ADMIN",
        COMPANY: "ADMIN",
      },
      order: 30,
    },
  },
};
