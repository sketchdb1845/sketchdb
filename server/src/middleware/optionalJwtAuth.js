import { verifySessionToken } from "../lib/jwt.js";

function readBearerToken(header) {
  if (!header || !header.startsWith("Bearer ")) {
    return "";
  }

  return header.slice(7).trim();
}

export function optionalJwtAuth(req, _res, next) {
  try {
    const token = req.cookies?.sketchdb_session || readBearerToken(req.headers.authorization);
    if (!token) {
      req.user = null;
      return next();
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
    req.user = null;
    return next();
  }
}
