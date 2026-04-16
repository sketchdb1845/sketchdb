import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { getRequiredEnv } from "./env.js";

const betterAuthUrl = process.env.BETTER_AUTH_URL;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const betterAuthSecret = getRequiredEnv("BETTER_AUTH_SECRET");
const trustedOrigins = [
  ...clientOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  betterAuthUrl,
].filter(Boolean);

export const auth = betterAuth({
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  trustedOrigins,
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
