import { createAuthClient } from "better-auth/react";

const apiBaseUrl = import.meta.env.VITE_API_URL;

export const authClient = createAuthClient({
  baseURL: `${apiBaseUrl}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
});

export const appApiBaseUrl = apiBaseUrl;

export async function getAppSession(options?: { bootstrap?: boolean }) {
  const sessionUrl = new URL(`${apiBaseUrl}/api/auth/session`);
  if (options?.bootstrap) {
    sessionUrl.searchParams.set("bootstrap", "1");
  }

  const response = await fetch(sessionUrl.toString(), {
    credentials: "include",
  });

  if (!response.ok) {
    return { user: null };
  }

  return (await response.json()) as { user: { id: string; email: string; name?: string } | null };
}

export async function logoutAppSession() {
  await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
