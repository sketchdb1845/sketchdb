import { verifySessionToken } from "../lib/jwt.js";

function readBearerToken(header) {
  if (!header || !header.startsWith("Bearer ")) {
    return "";
  }

  return header.slice(7).trim();
}

export function requireJwtAuth(req, res, next) {
  try {
    const token = req.cookies?.sketchdb_session || readBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifySessionToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
    req.jwt = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}