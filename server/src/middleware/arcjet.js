import { aj } from "../lib/arcjet.js";

export async function arcjetMiddleware(req, res, next) {
  try {
    const userId = req.user?.id || "anonymous";
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      return res.status(429).json({ message: "Too many requests" });
    }

    return next();
  } catch (error) {
    console.error("Arcjet error:", error);
    return res.status(503).json({ message: "Security check failed" });
  }
}
