import { createAuthClient } from "better-auth/react";

const apiBaseUrl = import.meta.env.VITE_API_URL;

export const authClient = createAuthClient({
  baseURL: `${apiBaseUrl}/api/auth`,
});

export const appApiBaseUrl = apiBaseUrl;
