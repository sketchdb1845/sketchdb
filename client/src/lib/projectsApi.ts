import { appApiBaseUrl } from "./authClient";

export interface SqlProject {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErProject {
  id: string;
  name: string;
  erJson: string;
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

export async function getSqlProjects() {
  return request<{ projects: SqlProject[] }>("/api/sql-projects");
}

export async function getSqlProjectById(id: string) {
  return request<{ project: SqlProject }>(`/api/sql-projects/${id}`);
}

export async function createSqlProject(name: string, sql: string) {
  return request<{ project: SqlProject }>("/api/sql-projects", {
    method: "POST",
    body: JSON.stringify({ name, sql }),
  });
}

export async function updateSqlProject(id: string, data: Partial<Pick<SqlProject, "name" | "sql">>) {
  return request<{ project: SqlProject }>(`/api/sql-projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSqlProject(id: string) {
  return request<null>(`/api/sql-projects/${id}`, {
    method: "DELETE",
  });
}

export async function getErProjects() {
  return request<{ projects: ErProject[] }>("/api/er-projects");
}

export async function getErProjectById(id: string) {
  return request<{ project: ErProject }>(`/api/er-projects/${id}`);
}

export async function createErProject(name: string, erJson: string) {
  return request<{ project: ErProject }>("/api/er-projects", {
    method: "POST",
    body: JSON.stringify({ name, erJson }),
  });
}

export async function updateErProject(id: string, data: Partial<Pick<ErProject, "name" | "erJson">>) {
  return request<{ project: ErProject }>(`/api/er-projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteErProject(id: string) {
  return request<null>(`/api/er-projects/${id}`, {
    method: "DELETE",
  });
}
