export const authCookieName = "sketchdb_session";

export function createSessionCookieOptions({ isProduction, authBaseUrl }) {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction || authBaseUrl.startsWith("https://"),
    path: "/",
  };
}

export function setSessionCookie(res, token, sessionCookieOptions, maxAgeMs) {
  res.cookie(authCookieName, token, {
    ...sessionCookieOptions,
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(res, sessionCookieOptions) {
  res.clearCookie(authCookieName, sessionCookieOptions);
}