export const COMMON_ROLES_UI = {
  "role.view": {
    sidebar: {
      key: "ROLES",
      label: "Roles",
      icon: "shield",
      route: "/admin/roles",
      module: "USERS",
      parentKey: {
        SCHOOL: "ADMIN",
        COMPANY: "ADMIN",
      },
      order: 20,
    },
  },
};
