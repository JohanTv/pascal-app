import { createAccessControl } from "better-auth/plugins/access";
import { ROLES } from "./constants";

const statement = {
  core: ["access_dashboard"],
  // dashboard: ["view_admin", "view_sales"],
  // leads: ["create", "read", "update", "delete"],
  // settings: ["manage"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  core: ["access_dashboard"],
});

export const salesAgentRole = ac.newRole({
  core: ["access_dashboard"],
});

export const roleMap = {
  [ROLES.ADMIN]: adminRole,
  [ROLES.SALES_AGENT]: salesAgentRole,
};
