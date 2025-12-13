export const ROLES = {
  ADMIN: "admin",
  SALES_AGENT: "sales_agent",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Route constants
export const ROUTES = {
  // Public routes
  HOME: "/",

  // Intranet routes
  INTRANET: {
    LOGIN: "/intranet",
    ADMIN: {
      DASHBOARD: "/intranet/admin/dashboard",
      USERS: "/intranet/admin/users",
      USERS_NEW: "/intranet/admin/users/new",
      CHATS: "/intranet/admin/chats",
      BASE: "/intranet/admin",
    },
    SALES_AGENT: {
      DASHBOARD: "/intranet/sales-agent/dashboard",
      CHATS: "/intranet/sales-agent/chats",
      BASE: "/intranet/sales-agent",
    },
  },
} as const;
