import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import sqlProjectsRouter from "./routes/sqlProjects.js";
import erProjectsRouter from "./routes/erProjects.js";
import { ensureProjectTables } from "./db/bootstrap.js";
import { arcjetMiddleware } from "./middleware/arcjet.js";
import { requireJwtAuth } from "./middleware/jwtAuth.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { createSessionCookieOptions } from "./lib/sessionCookies.js";

const isProduction = process.env.NODE_ENV === "production";
const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const authBaseUrl = process.env.BETTER_AUTH_URL || `http://localhost:${port}`;
const sessionCookieOptions = createSessionCookieOptions({ isProduction, authBaseUrl });

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

registerAuthRoutes(app, { arcjetMiddleware, sessionCookieOptions });

app.use("/api/sql-projects", requireJwtAuth, arcjetMiddleware, sqlProjectsRouter);
app.use("/api/er-projects", requireJwtAuth, arcjetMiddleware, erProjectsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

await ensureProjectTables();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
