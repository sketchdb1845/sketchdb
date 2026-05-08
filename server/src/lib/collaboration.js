import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { projectCollaborators, projectShares, users } from "../db/schema.js";

const DEFAULT_PUBLIC_ACCESS = "private";

export async function resolveProjectPermission(projectType, project, requester) {
  if (!project) {
    return { access: "none", permission: "none", role: "none", isPublic: false };
  }

  const requesterEmail = requester?.email?.toLowerCase?.() || "";
  const ownerEmail = project.ownerEmail?.toLowerCase?.() || "";
  const isOwner = Boolean(requester?.id && requester.id === project.userId);

  if (isOwner) {
    return { access: "edit", permission: "can_edit", role: "owner", isPublic: false };
  }

  if (requesterEmail && requesterEmail === ownerEmail) {
    return { access: "edit", permission: "can_edit", role: "owner", isPublic: false };
  }

  const collaboratorRows = await db
    .select()
    .from(projectCollaborators)
    .where(
      and(
        eq(projectCollaborators.projectType, projectType),
        eq(projectCollaborators.projectId, project.id),
        requester?.id
          ? eq(projectCollaborators.collaboratorUserId, requester.id)
          : eq(projectCollaborators.collaboratorEmail, requesterEmail),
      ),
    )
    .limit(1);

  const collaborator = collaboratorRows[0];
  if (collaborator) {
    if (collaborator.status !== "accepted" && requester?.id) {
      await db
        .update(projectCollaborators)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(projectCollaborators.id, collaborator.id));
    }

    const canEdit = collaborator.permission === "can_edit";
    return {
      access: canEdit ? "edit" : "view",
      permission: collaborator.permission,
      role: "collaborator",
      isPublic: false,
    };
  }

  const shareRows = await db
    .select()
    .from(projectShares)
    .where(
      and(
        eq(projectShares.projectType, projectType),
        eq(projectShares.projectId, project.id),
      ),
    )
    .limit(1);

  const share = shareRows[0];
  const isPublic = share?.publicAccess === "view";
  if (isPublic) {
    return { access: "view", permission: "can_view", role: "public", isPublic: true };
  }

  return { access: "none", permission: "none", role: "none", isPublic: false };
}

export async function listCollaborators(projectType, projectId) {
  const rows = await db
    .select({
      id: projectCollaborators.id,
      collaboratorUserId: projectCollaborators.collaboratorUserId,
      collaboratorEmail: projectCollaborators.collaboratorEmail,
      permission: projectCollaborators.permission,
      status: projectCollaborators.status,
      createdAt: projectCollaborators.createdAt,
      updatedAt: projectCollaborators.updatedAt,
      name: users.name,
    })
    .from(projectCollaborators)
    .leftJoin(users, eq(users.id, projectCollaborators.collaboratorUserId))
    .where(
      and(
        eq(projectCollaborators.projectType, projectType),
        eq(projectCollaborators.projectId, projectId),
      ),
    );

  return rows.map((row) => ({
    ...row,
    name: row.name || null,
  }));
}

export async function getPublicShare(projectType, projectId) {
  const rows = await db
    .select()
    .from(projectShares)
    .where(
      and(
        eq(projectShares.projectType, projectType),
        eq(projectShares.projectId, projectId),
      ),
    )
    .limit(1);

  return rows[0] || null;
}

export async function upsertPublicShare(projectType, projectId, ownerUserId, publicAccess) {
  const existing = await getPublicShare(projectType, projectId);
  if (!existing) {
    const [created] = await db
      .insert(projectShares)
      .values({
        projectType,
        projectId,
        ownerUserId,
        publicAccess: publicAccess || DEFAULT_PUBLIC_ACCESS,
      })
      .returning();
    return created;
  }

  const [updated] = await db
    .update(projectShares)
    .set({
      publicAccess: publicAccess || DEFAULT_PUBLIC_ACCESS,
      updatedAt: new Date(),
    })
    .where(eq(projectShares.id, existing.id))
    .returning();
  return updated;
}

export async function addCollaborator(projectType, project, email, permission) {
  const normalizedEmail = email.trim().toLowerCase();
  const userRows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  const matchedUser = userRows[0] || null;

  const existingRows = await db
    .select()
    .from(projectCollaborators)
    .where(
      and(
        eq(projectCollaborators.projectType, projectType),
        eq(projectCollaborators.projectId, project.id),
        eq(projectCollaborators.collaboratorEmail, normalizedEmail),
      ),
    )
    .limit(1);

  const status = matchedUser ? "accepted" : "pending";
  if (existingRows[0]) {
    const [updated] = await db
      .update(projectCollaborators)
      .set({
        collaboratorUserId: matchedUser?.id || null,
        collaboratorEmail: normalizedEmail,
        permission,
        status,
        updatedAt: new Date(),
      })
      .where(eq(projectCollaborators.id, existingRows[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(projectCollaborators)
    .values({
      projectType,
      projectId: project.id,
      ownerUserId: project.userId,
      collaboratorUserId: matchedUser?.id || null,
      collaboratorEmail: normalizedEmail,
      permission,
      status,
    })
    .returning();

  return created;
}
