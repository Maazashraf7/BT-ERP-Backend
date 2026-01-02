export const PERMISSION_UI_MAP = {
  /* 📦 ORDERS */
  ORDERS_VIEW: {
    sidebar: {
      key: "ORDERS_LIST",
      label: "All Orders",
      icon: "clipboard",
      route: "/orders",
      module: "RESTAURANT_ORDERS",
      parentKey: { RESTAURANT: "ORDERS" },
      order: 10,
    },
  },

  ORDERS_UPDATE_STATUS: {
    sidebar: {
      key: "KITCHEN",
      label: "Kitchen",
      icon: "fire",
      route: "/kitchen",
      module: "RESTAURANT_ORDERS",
      parentKey: { RESTAURANT: "ORDERS" },
      order: 20,
    },
  },

  /* 🍽 MENU */
  MENU_VIEW: {
    sidebar: {
      key: "MENU_ITEMS",
      label: "Menu Items",
      icon: "utensils",
      route: "/menu",
      module: "RESTAURANT_MENU",
      parentKey: { RESTAURANT: "MENU" },
      order: 10,
    },
  },

  /* 👥 CUSTOMERS */
  CUSTOMERS_VIEW: {
    sidebar: {
      key: "CUSTOMERS_LIST",
      label: "Customers",
      icon: "users",
      route: "/customers",
      module: "RESTAURANT_CUSTOMERS",
      parentKey: { RESTAURANT: "CUSTOMERS" },
      order: 10,
    },
  },

  /* 💳 PAYMENTS */
  PAYMENTS_VIEW: {
    sidebar: {
      key: "PAYMENTS",
      label: "Payments",
      icon: "credit-card",
      route: "/payments",
      module: "RESTAURANT_PAYMENTS",
      parentKey: { RESTAURANT: "PAYMENTS" },
      order: 10,
    },
  },

  /* 📊 REPORTS */
  REPORTS_VIEW: {
    sidebar: {
      key: "REPORTS",
      label: "Reports",
      icon: "bar-chart",
      route: "/reports",
      module: "RESTAURANT_REPORTS",
      parentKey: { RESTAURANT: "REPORTS" },
      order: 10,
    },
  },

  /* 🔐 SETTINGS / SECURITY */
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



  "student.view": {
    sidebar: {
      key: "STUDENTS",
      label: "Students",
      icon: "users",
      route: "/students",
      module: "STUDENTS",
      parentKey: {
        SCHOOL: "ADMIN",
        COMPANY: "HR",
      },
      order: 10,
    },
  },

  "attendance.view": {
    sidebar: {
      key: "ATTENDANCE",
      label: "Attendance",
      icon: "calendar",
      route: "/attendance",
      module: "ATTENDANCE",
      parentKey: {
        SCHOOL: "ACADEMICS",
        COMPANY: "HR",
      },
      order: 20,
    },
  },

  "manage_students": {
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

  "manage_attendance": {
    sidebar: {
      key: "ATTENDANCE_ADMIN",
      label: "Attendance Admin",
      icon: "calendar-check",
      route: "/admin/attendance",
      module: "ATTENDANCE",
      parentKey: {
        SCHOOL: "SECURITY",
        COMPANY: "HR",
      },
      order: 40,
    },
  },

    // 🔐 ROLES
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

  // 🔐 PERMISSIONS
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

