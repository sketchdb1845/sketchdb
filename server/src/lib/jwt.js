import jwt from "jsonwebtoken";
import { jwtSecret } from "./auth.js";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export function signSessionToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: sessionMaxAgeSeconds }
  );
}

export function verifySessionToken(token) {
  return jwt.verify(token, jwtSecret);
}

export function getSessionMaxAgeSeconds() {
  return sessionMaxAgeSeconds;
}