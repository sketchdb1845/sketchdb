import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { verifySessionToken, signSessionToken, getSessionMaxAgeSeconds } from "../lib/jwt.js";
import { authCookieName, clearSessionCookie, setSessionCookie } from "../lib/sessionCookies.js";

export function registerAuthRoutes(app, { arcjetMiddleware, sessionCookieOptions }) {
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
      setSessionCookie(res, token, sessionCookieOptions, getSessionMaxAgeSeconds() * 1000);

      return res.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      });
    } catch {
      clearSessionCookie(res, sessionCookieOptions);
      return res.json({ user: null });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    clearSessionCookie(res, sessionCookieOptions);
    return res.status(204).send();
  });

  app.use("/api/auth", async (req, res, next) => {
    if (req.method === "POST" && req.path === "/sign-in/email") {
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (body?.data?.user) {
          const token = signSessionToken(body.data.user);
          setSessionCookie(res, token, sessionCookieOptions, getSessionMaxAgeSeconds() * 1000);
        }
        return originalJson(body);
      };
    }

    if (req.method === "POST" && req.path === "/sign-up/email") {
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (body?.data?.user) {
          const token = signSessionToken(body.data.user);
          setSessionCookie(res, token, sessionCookieOptions, getSessionMaxAgeSeconds() * 1000);
        }
        return originalJson(body);
      };
    }

    if (req.method === "POST" && req.path === "/sign-out") {
      clearSessionCookie(res, sessionCookieOptions);
    }

    return arcjetMiddleware(req, res, () => toNodeHandler(auth)(req, res, next));
  });
}