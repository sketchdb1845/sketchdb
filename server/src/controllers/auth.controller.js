import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { arcjetMiddleware } from "../middleware/arcjet.js";
import { signSessionToken, verifySessionToken } from "../lib/jwt.js";
import {
  clearSessionCookie,
  getSessionCookieOptions,
  setSessionCookie,
  authCookieName,
} from "../lib/session.js";

const isProduction = process.env.NODE_ENV === "production";
const authBaseUrl = process.env.BETTER_AUTH_URL ;
const sessionCookieOptions = getSessionCookieOptions({ isProduction, authBaseUrl });

export async function getSession(req, res) {
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
    setSessionCookie(res, token, sessionCookieOptions);

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
}

export async function logout(_req, res) {
  clearSessionCookie(res, sessionCookieOptions);
  return res.status(204).send();
}

export async function authProxy(req, res, next) {
  if (req.method === "POST" && req.path === "/sign-in/email") {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body?.data?.user) {
        const token = signSessionToken(body.data.user);
        setSessionCookie(res, token, sessionCookieOptions);
      }
      return originalJson(body);
    };
  }

  if (req.method === "POST" && req.path === "/sign-up/email") {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body?.data?.user) {
        const token = signSessionToken(body.data.user);
        setSessionCookie(res, token, sessionCookieOptions);
      }
      return originalJson(body);
    };
  }

  if (req.method === "POST" && req.path === "/sign-out") {
    clearSessionCookie(res, sessionCookieOptions);
  }

  return arcjetMiddleware(req, res, () => toNodeHandler(auth)(req, res, next));
}