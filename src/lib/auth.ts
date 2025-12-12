import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { ROLES } from "./constants";
import prisma from "./db";
import { ac, roleMap } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI:
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google` as string,
    },
  },
  plugins: [
    admin({
      ac,
      roles: roleMap,
      defaultRole: ROLES.SALES_AGENT,
      adminRole: ROLES.ADMIN,
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: ROLES.SALES_AGENT,
        input: false,
      },
    },
  },
});
