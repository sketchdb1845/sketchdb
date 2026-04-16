import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { getRequiredEnv } from "./env.js";

const betterAuthUrl = process.env.BETTER_AUTH_URL;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const betterAuthSecret = getRequiredEnv("BETTER_AUTH_SECRET");
const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  trustedOrigins: [clientOrigin, betterAuthUrl],
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Wire this to your email provider in production.
      console.log(`Password reset link for ${user.email}: ${url}`);
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset completed for ${user.email}`);
    },
  },
});

export const jwtSecret = getRequiredEnv("JWT_SECRET");
