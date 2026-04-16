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

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const authBaseUrl = process.env.BETTER_AUTH_URL || `http://localhost:${port}`;
const clientOrigins = clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isHttpsAuthBase = authBaseUrl.startsWith("https://");

function isCrossOriginAuthFlow() {
  try {
    const authOrigin = new URL(authBaseUrl).origin;
    return clientOrigins.some((origin) => {
      try {
        return new URL(origin).origin !== authOrigin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

function getSessionCookieOptions() {
  const crossOrigin = isCrossOriginAuthFlow();
  const sameSite = crossOrigin && isHttpsAuthBase ? "none" : "lax";

  return {
    httpOnly: true,
    sameSite,
    secure: isHttpsAuthBase,
    maxAge: getSessionMaxAgeSeconds() * 1000,
    path: "/",
  };
}

function extractAuthUserFromBody(body) {
  return (
    body?.data?.user ||
    body?.user ||
    body?.data?.session?.user ||
    body?.session?.user ||
    null
  );
}

function setJwtCookieForAuthUser(res, body) {
  const user = extractAuthUserFromBody(body);
  if (!user?.id || !user?.email) {
    return;
  }

  const token = signSessionToken(user);
  res.cookie(authCookieName, token, getSessionCookieOptions());
}

function attachAuthCookieBridge(req, res) {
  const isEmailSignIn = req.method === "POST" && req.path === "/sign-in/email";
  const isEmailSignUp = req.method === "POST" && req.path === "/sign-up/email";

  if (!isEmailSignIn && !isEmailSignUp) {
    return;
  }

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  const chunks = [];

  res.json = (body) => {
    setJwtCookieForAuthUser(res, body);
    return originalJson(body);
  };

  res.send = (body) => {
    if (typeof body === "string") {
      try {
        setJwtCookieForAuthUser(res, JSON.parse(body));
      } catch {
        // Ignore non-JSON payloads.
      }
    } else if (body && typeof body === "object") {
      setJwtCookieForAuthUser(res, body);
    }

    return originalSend(body);
  };

  res.write = (chunk, encoding, callback) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === "string" ? encoding : undefined));
    }
    return originalWrite(chunk, encoding, callback);
  };

  res.end = (chunk, encoding, callback) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === "string" ? encoding : undefined));
    }

    if (chunks.length > 0) {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        setJwtCookieForAuthUser(res, JSON.parse(raw));
      } catch {
        // Ignore non-JSON payloads.
      }
    }

    return originalEnd(chunk, encoding, callback);
  };
}

app.use(
  cors({
    origin: clientOrigins,
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
      return res.status(401).json({ user: null });
    }

    const token = signSessionToken(session.user);
    res.cookie(authCookieName, token, getSessionCookieOptions());

    return res.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch {
    res.clearCookie(authCookieName, { path: "/" });
    return res.json({ user: null });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(authCookieName, { path: "/" });
  return res.status(204).send();
});

app.use("/api/auth", async (req, res, next) => {
  attachAuthCookieBridge(req, res);

  if (req.method === "POST" && req.path === "/sign-out") {
    res.clearCookie(authCookieName, { path: "/" });
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
