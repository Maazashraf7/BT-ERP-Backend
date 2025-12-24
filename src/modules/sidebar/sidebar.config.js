export const SIDEBAR_TREE = [
  {
    key: "DASHBOARD",
    label: "Dashboard",
    icon: "dashboard",
    route: "/dashboard",
    module: "DASHBOARD",
    permission: null,
    domain: "COMMON",
  },

  {
    key: "EDUCATION",
    label: "Education",
    icon: "school",
    domain: "EDUCATION",
    module: "EDUCATION", // optional
    children: [
      {
        key: "STUDENTS",
        label: "Students",
        route: "/education/students",
        module: "STUDENTS",
        permission: "STUDENT_VIEW",
      },
      {
        key: "ATTENDANCE",
        label: "Attendance",
        route: "/education/attendance",
        module: "ATTENDANCE",
        permission: "ATTENDANCE_VIEW",
      },
      {
        key: "FEES",
        label: "Fees",
        route: "/education/fees",
        module: "FEES",
        permission: "FEES_VIEW",
      },
    ],
  },

  {
    key: "HEALTHCARE",
    label: "Healthcare",
    icon: "heart",
    domain: "HEALTHCARE",
    module: "HEALTHCARE",
    children: [
      {
        key: "APPOINTMENTS",
        label: "Appointments",
        route: "/healthcare/appointments",
        module: "APPOINTMENTS",
        permission: "APPOINTMENT_VIEW",
      },
    ],
  },

  {
    key: "ADMIN",
    label: "Administration",
    icon: "settings",
    domain: "COMMON",
    module: "ADMIN",
    children: [
      {
        key: "USERS",
        label: "Users",
        route: "/admin/users",
        module: "USERS",
        permission: "USER_VIEW",
      },
      {
        key: "SETTINGS",
        label: "Settings",
        route: "/admin/settings",
        module: "SETTINGS",
        permission: "SETTINGS_VIEW",
      },
    ],
  },
];
