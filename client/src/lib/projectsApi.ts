import { appApiBaseUrl } from "./authClient";

export interface Project {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${appApiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function getProjects() {
  return request<{ projects: Project[] }>("/api/projects");
}

export async function getProjectById(id: string) {
  return request<{ project: Project }>(`/api/projects/${id}`);
}

export async function createProject(name: string, sql: string) {
  return request<{ project: Project }>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name, sql }),
  });
}

export async function updateProject(id: string, data: Partial<Pick<Project, "name" | "sql">>) {
  return request<{ project: Project }>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return request<null>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}
