import arcjet, { shield, tokenBucket } from "@arcjet/node";
import { getRequiredEnv } from "./env.js";

const arcjetKey = getRequiredEnv("ARCJET_KEY");

export const aj = arcjet({
  key: arcjetKey,
  characteristics: ["userId", "ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: "1m",
      capacity: 40,
    }),
  ],
});
