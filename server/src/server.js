import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import projectsRouter from "./routes/projects.js";
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
      return res.status(401).json({ user: null });
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ user: null });
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
    return res.status(401).json({ user: null });
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

app.use("/api/projects", requireJwtAuth, arcjetMiddleware, projectsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
