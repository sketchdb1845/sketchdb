import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import sqlProjectsRouter from "./routes/sqlProjects.js";
import erProjectsRouter from "./routes/erProjects.js";
import { sql as dbSql } from "./db/client.js";
import { auth } from "./lib/auth.js";
import { arcjetMiddleware } from "./middleware/arcjet.js";
import { requireJwtAuth } from "./middleware/jwtAuth.js";
import { verifySessionToken } from "./lib/jwt.js";
import { signSessionToken, getSessionMaxAgeSeconds } from "./lib/jwt.js";

const authCookieName = "sketchdb_session";
const isProduction = process.env.NODE_ENV === "production";

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const authBaseUrl = process.env.BETTER_AUTH_URL || `http://localhost:${port}`;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction || authBaseUrl.startsWith("https://"),
  path: "/",
};

const setSessionCookie = (res, token) => {
  res.cookie(authCookieName, token, {
    ...sessionCookieOptions,
    maxAge: getSessionMaxAgeSeconds() * 1000,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(authCookieName, sessionCookieOptions);
};

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const existingToken = req.cookies?.[authCookieName];
    if (existingToken) {
      const decoded = verifySessionToken(existingToken);
      return res.json({
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
        },
      });
    }

    // Bootstrap mode is used only right after Better Auth sign-in/sign-up.
    // Normal app guards should rely on the JWT cookie only.
    if (req.query.bootstrap !== "1") {
      return res.json({ user: null });
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.json({ user: null });
    }

    const token = signSessionToken(session.user);
    setSessionCookie(res, token);

    return res.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch {
    clearSessionCookie(res);
    return res.json({ user: null });
  }
});

app.post("/api/auth/logout", (req, res) => {
  clearSessionCookie(res);
  return res.status(204).send();
});

app.use("/api/auth", async (req, res, next) => {
  if (req.method === "POST" && req.path === "/sign-in/email") {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body?.data?.user) {
        const token = signSessionToken(body.data.user);
        setSessionCookie(res, token);
      }
      return originalJson(body);
    };
  }

  if (req.method === "POST" && req.path === "/sign-up/email") {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body?.data?.user) {
        const token = signSessionToken(body.data.user);
        setSessionCookie(res, token);
      }
      return originalJson(body);
    };
  }

  if (req.method === "POST" && req.path === "/sign-out") {
    clearSessionCookie(res);
  }

  return arcjetMiddleware(req, res, () => toNodeHandler(auth)(req, res, next));
});

app.use("/api/sql-projects", requireJwtAuth, arcjetMiddleware, sqlProjectsRouter);
app.use("/api/er-projects", requireJwtAuth, arcjetMiddleware, erProjectsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const ensureProjectTables = async () => {
  const existingProjectTables = await dbSql`
    select table_name
    from information_schema.tables
    where table_schema = current_schema()
      and table_name in ('sql_projects', 'er_projects')
  `;

  const tableNames = new Set(existingProjectTables.map((row) => row.table_name));

  if (!tableNames.has("sql_projects")) {
    await dbSql`
      create table sql_projects (
        id uuid primary key default gen_random_uuid(),
        user_id text not null references "user"(id) on delete cascade,
        name varchar(150) not null,
        sql text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  if (!tableNames.has("er_projects")) {
    await dbSql`
      create table er_projects (
        id uuid primary key default gen_random_uuid(),
        user_id text not null references "user"(id) on delete cascade,
        name varchar(150) not null,
        er_json text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  const legacyProjectsExists = await dbSql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = current_schema()
        and table_name = 'projects'
    ) as exists
  `;

  if (!legacyProjectsExists[0]?.exists) {
    return;
  }

  await dbSql`
    insert into sql_projects (id, user_id, name, sql, created_at, updated_at)
    select id, user_id, name, sql, created_at, updated_at
    from projects
    where coalesce(project_type, 'sql') = 'sql'
      and sql is not null
      and btrim(sql) <> ''
    on conflict (id) do nothing
  `;

  await dbSql`
    insert into er_projects (id, user_id, name, er_json, created_at, updated_at)
    select id, user_id, name, er_json, created_at, updated_at
    from projects
    where coalesce(project_type, 'sql') = 'er'
      and er_json is not null
      and btrim(er_json) <> ''
    on conflict (id) do nothing
  `;
};

await ensureProjectTables();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
