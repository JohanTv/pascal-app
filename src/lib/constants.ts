export const ROLES = {
  ADMIN: "admin",
  SALES_AGENT: "sales_agent",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
