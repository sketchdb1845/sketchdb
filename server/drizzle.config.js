import { defineConfig } from "drizzle-kit";
import "./src/lib/env.js";
import { getDatabaseUrl } from "./src/lib/env.js";

export default defineConfig({
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
