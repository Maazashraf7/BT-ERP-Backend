export const RESTAURANT_ORDERS_UI = {
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
};
