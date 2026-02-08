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
      {

        key: "ROLES",
        label: "Roles",
        route: "/admin/roles",
        module: "ROLES",
        permission: "ROLE_VIEW",
      },
      {

        key: "TENANT_PROFILE",
        label: "Tenant Profile",
        route: "/admin/tenant-profile",
        module: "TENANT_PROFILE",
        permission: "TENANT_PROFILE_VIEW",
      },

      {
        key: "BRANDING",
        label: "Branding",
        route: "/admin/branding",
        module: "BRANDING",
        permission: "BRANDING_VIEW",  
      },
     
      {
        key: "PERMISSIONS",
        label: "Permissions",
        route: "/admin/permissions",
        module: "PERMISSIONS",
        permission: "PERMISSION_VIEW",  

      },

      {
        key: "SIDEBAR",
        label: "Sidebar",
        route: "/admin/sidebar",
        module: "SIDEBAR",
        permission: "SIDEBAR_VIEW",
      },
      {
        key: "TENANT_MODULES",
        label: "Tenant Modules",
        route: "/admin/tenant-modules",
        module: "TENANT_MODULES",
        permission: "TENANT_MODULES_VIEW",

      },
      {
        key: "AUDIT_LOGS",
        label: "Audit Logs",
        route: "/admin/audit-logs",
        module: "AUDIT_LOGS",
        permission: "AUDIT_LOG_VIEW",
      }
    ],
  },
];
