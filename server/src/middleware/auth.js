import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;
    return next();
  } catch (error) {
    console.error("Session error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
