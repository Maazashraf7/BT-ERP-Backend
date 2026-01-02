export const SIDEBAR_GROUPS_BY_TENANT = {
  SCHOOL: {
    ADMIN: { key: "ADMIN", label: "Administration", icon: "settings", order: 10 },
    ACADEMICS: { key: "ACADEMICS", label: "Academics", icon: "book", order: 20 },
    SECURITY: { key: "SECURITY", label: "Security", icon: "shield", parentKey: "ADMIN", order: 30 },
  },

  COMPANY: {
    ADMIN: { key: "ADMIN", label: "Admin Panel", icon: "settings", order: 10 },
    HR: { key: "HR", label: "Human Resources", icon: "users", order: 20 },
    SECURITY: { key: "SECURITY", label: "Access Control", icon: "shield", parentKey: "ADMIN", order: 30 },
  },

  RESTAURANT: {

    ORDERS: {
      key: "ORDERS",
      label: "Orders",
      icon: "shopping-bag",
      order: 20,
    },

    MENU: {
      key: "MENU",
      label: "Menu Management",
      icon: "utensils",
      order: 30,
    },

    CUSTOMERS: {
      key: "CUSTOMERS",
      label: "Customers",
      icon: "users",
      order: 40,
    },

    PAYMENTS: {
      key: "PAYMENTS",
      label: "Payments",
      icon: "credit-card",
      order: 50,
    },

    REPORTS: {
      key: "REPORTS",
      label: "Reports & Analytics",
      icon: "bar-chart",
      order: 60,
    },

    SETTINGS: {
      key: "SETTINGS",
      label: "Restaurant Settings",
      icon: "settings",
      order: 70,
    },

    SECURITY: {
      key: "SECURITY",
      label: "Access Control",
      icon: "shield",
      parentKey: "SETTINGS",
      order: 80,
    },
  },
};
