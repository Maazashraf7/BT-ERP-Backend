export const COMMON_USERS_UI = {
  manage_students: {
    sidebar: {
      key: "USERS",
      label: "Users",
      icon: "users",
      route: "/admin/users",
      module: "USERS",
      parentKey: {
        SCHOOL: "ADMIN",
        COMPANY: "HR",
      },
      order: 30,
    },
  },
};
