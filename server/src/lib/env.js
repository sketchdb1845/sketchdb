import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const dotenvPath = fileURLToPath(new URL("../../.env", import.meta.url));

dotenv.config({ path: dotenvPath, override: true });

const POSTGRES_URL_PATTERN = /(postgres(?:ql)?:\/\/[^\s'"`]+)/i;

function normalizeConnectionString(value) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  const extracted = trimmed.match(POSTGRES_URL_PATTERN)?.[1] ?? trimmed;

  try {
    new URL(extracted);
    return extracted;
  } catch {
    return "";
  }
}

export function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value.replace(/^['"]|['"]$/g, "");
}

export function getDatabaseUrl() {
  const directValue = normalizeConnectionString(process.env.DATABASE_URL);
  if (directValue) {
    return directValue;
  }

  throw new Error(
    "DATABASE_URL must be a valid PostgreSQL connection string, for example postgresql://user:pass@host:5432/db"
  );
}