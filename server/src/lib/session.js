import { getSessionMaxAgeSeconds } from "./jwt.js";

export const authCookieName = "sketchdb_session";

export function getSessionCookieOptions({ isProduction, authBaseUrl }) {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction || authBaseUrl.startsWith("https://"),
    path: "/",
  };
}

export function setSessionCookie(res, token, sessionCookieOptions) {
  res.cookie(authCookieName, token, {
    ...sessionCookieOptions,
    maxAge: getSessionMaxAgeSeconds() * 1000,
  });
}

export function clearSessionCookie(res, sessionCookieOptions) {
  res.clearCookie(authCookieName, sessionCookieOptions);
}