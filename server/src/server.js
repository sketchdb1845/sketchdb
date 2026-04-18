import "dotenv/config";
import { ensureProjectTables } from "./db/bootstrap.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import sqlProjectsRouter from "./routes/sqlProjects.js";
import erProjectsRouter from "./routes/erProjects.js";
import { arcjetMiddleware } from "./middleware/arcjet.js";
import { requireJwtAuth } from "./middleware/jwtAuth.js";


const port = Number(process.env.PORT || 4000);

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

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

app.use("/api/auth", authRouter);
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
