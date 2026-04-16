import "dotenv/config";
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import projectsRouter from "./routes/projects.js";
import { auth } from "./lib/auth.js";
import { arcjetMiddleware } from "./middleware/arcjet.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.all("/api/auth/*", arcjetMiddleware, toNodeHandler(auth));

app.use(express.json());

app.use("/api/projects", requireAuth, arcjetMiddleware, projectsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
