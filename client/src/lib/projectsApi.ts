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

export interface Collaborator {
  id: string;
  collaboratorUserId: string | null;
  collaboratorEmail: string;
  permission: "can_view" | "can_edit";
  status: "pending" | "accepted";
  name: string | null;
}

export interface CollaborationSettings {
  collaborators: Collaborator[];
  publicAccess: "private" | "view";
  owner: {
    email: string;
    name: string | null;
  };
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

export async function getPublicSqlProjectById(id: string) {
  return request<{ project: SqlProject; access: "view" | "edit"; isPublic: boolean }>(`/api/sql-projects/public/${id}`);
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

export async function getSqlCollaboration(id: string) {
  return request<CollaborationSettings>(`/api/sql-projects/${id}/collaboration`);
}

export async function addSqlCollaborator(id: string, email: string, permission: "can_view" | "can_edit") {
  return request<{ collaborator: Collaborator }>(`/api/sql-projects/${id}/collaborators`, {
    method: "POST",
    body: JSON.stringify({ email, permission }),
  });
}

export async function updateSqlCollaborator(
  id: string,
  collaboratorId: string,
  permission: "can_view" | "can_edit",
) {
  return request<{ collaborator: Collaborator }>(`/api/sql-projects/${id}/collaborators/${collaboratorId}`, {
    method: "PUT",
    body: JSON.stringify({ permission }),
  });
}

export async function removeSqlCollaborator(id: string, collaboratorId: string) {
  return request<null>(`/api/sql-projects/${id}/collaborators/${collaboratorId}`, {
    method: "DELETE",
  });
}

export async function updateSqlPublicShare(id: string, publicAccess: "private" | "view") {
  return request<{ publicAccess: "private" | "view" }>(`/api/sql-projects/${id}/public-share`, {
    method: "PUT",
    body: JSON.stringify({ publicAccess }),
  });
}

export async function getErProjects() {
  return request<{ projects: ErProject[] }>("/api/er-projects");
}

export async function getErProjectById(id: string) {
  return request<{ project: ErProject }>(`/api/er-projects/${id}`);
}

export async function getPublicErProjectById(id: string) {
  return request<{ project: ErProject; access: "view" | "edit"; isPublic: boolean }>(`/api/er-projects/public/${id}`);
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

export async function getErCollaboration(id: string) {
  return request<CollaborationSettings>(`/api/er-projects/${id}/collaboration`);
}

export async function addErCollaborator(id: string, email: string, permission: "can_view" | "can_edit") {
  return request<{ collaborator: Collaborator }>(`/api/er-projects/${id}/collaborators`, {
    method: "POST",
    body: JSON.stringify({ email, permission }),
  });
}

export async function updateErCollaborator(
  id: string,
  collaboratorId: string,
  permission: "can_view" | "can_edit",
) {
  return request<{ collaborator: Collaborator }>(`/api/er-projects/${id}/collaborators/${collaboratorId}`, {
    method: "PUT",
    body: JSON.stringify({ permission }),
  });
}

export async function removeErCollaborator(id: string, collaboratorId: string) {
  return request<null>(`/api/er-projects/${id}/collaborators/${collaboratorId}`, {
    method: "DELETE",
  });
}

export async function updateErPublicShare(id: string, publicAccess: "private" | "view") {
  return request<{ publicAccess: "private" | "view" }>(`/api/er-projects/${id}/public-share`, {
    method: "PUT",
    body: JSON.stringify({ publicAccess }),
  });
}
