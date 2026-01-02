import { RESTAURANT_ORDERS_UI } from "./restaurant/orders.ui.js";
import { RESTAURANT_MENU_UI } from "./restaurant/menu.ui.js";
import { RESTAURANT_CUSTOMERS_UI } from "./restaurant/customers.ui.js";
import { RESTAURANT_PAYMENTS_UI } from "./restaurant/payments.ui.js";
import { RESTAURANT_REPORTS_UI } from "./restaurant/reports.ui.js";
import { RESTAURANT_SETTINGS_UI } from "./restaurant/settings.ui.js";

import { SCHOOL_STUDENTS_UI } from "./school/students.ui.js";
import { SCHOOL_ATTENDANCE_UI } from "./school/attendance.ui.js";

import { COMMON_USERS_UI } from "./common/users.ui.js";
import { COMMON_ROLES_UI } from "./common/roles.ui.js";
import { COMMON_PERMISSIONS_UI } from "./common/permissions.ui.js";

export const PERMISSION_UI_MAP = {
  ...RESTAURANT_ORDERS_UI,
  ...RESTAURANT_MENU_UI,
  ...RESTAURANT_CUSTOMERS_UI,
  ...RESTAURANT_PAYMENTS_UI,
  ...RESTAURANT_REPORTS_UI,
  ...RESTAURANT_SETTINGS_UI,

  ...SCHOOL_STUDENTS_UI,
  ...SCHOOL_ATTENDANCE_UI,

  ...COMMON_USERS_UI,
  ...COMMON_ROLES_UI,
  ...COMMON_PERMISSIONS_UI,
};
