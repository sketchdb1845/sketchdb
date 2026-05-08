import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { erProjects, projectCollaborators } from "../db/schema.js";
import {
  addCollaborator,
  getPublicShare,
  listCollaborators,
  resolveProjectPermission,
  upsertPublicShare,
} from "../lib/collaboration.js";

const createErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  erJson: z.string().trim().min(1),
});

const updateErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  erJson: z.string().trim().min(1).optional(),
});

const addCollaboratorSchema = z.object({
  email: z.string().email(),
  permission: z.enum(["can_view", "can_edit"]).default("can_edit"),
});

const updateCollaboratorSchema = z.object({
  permission: z.enum(["can_view", "can_edit"]),
});

const updatePublicShareSchema = z.object({
  publicAccess: z.enum(["private", "view"]),
});

export async function listErProjects(req, res) {
  const rows = await db
    .select({
      id: erProjects.id,
      name: erProjects.name,
      erJson: erProjects.erJson,
      createdAt: erProjects.createdAt,
      updatedAt: erProjects.updatedAt,
    })
    .from(erProjects)
    .where(eq(erProjects.userId, req.user.id))
    .orderBy(desc(erProjects.updatedAt));

  return res.json({ projects: rows });
}

export async function getErProject(req, res) {
  const rows = await db.select().from(erProjects).where(eq(erProjects.id, req.params.id)).limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  const permission = await resolveProjectPermission("er", project, req.user);
  if (permission.access === "none") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  return res.json({ project, access: permission.access });
}

export async function getPublicErProject(req, res) {
  const rows = await db.select().from(erProjects).where(eq(erProjects.id, req.params.id)).limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const permission = await resolveProjectPermission("er", project, req.user || null);
  if (permission.access === "none") {
    return res.status(403).json({ message: "This project is private" });
  }

  return res.json({ project, access: permission.access, isPublic: permission.isPublic });
}

export async function createErProject(req, res) {
  const parsed = createErProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [created] = await db
    .insert(erProjects)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      erJson: parsed.data.erJson,
    })
    .returning();

  return res.status(201).json({ project: created });
}

export async function updateErProject(req, res) {
  const parsed = updateErProjectSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.name && !parsed.data.erJson)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const rows = await db.select().from(erProjects).where(eq(erProjects.id, req.params.id)).limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  const permission = await resolveProjectPermission("er", project, req.user);
  if (permission.access !== "edit") {
    return res.status(403).json({ message: "You need Can Edit permission" });
  }

  const [updated] = await db
    .update(erProjects)
    .set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.erJson ? { erJson: parsed.data.erJson } : {}),
      updatedAt: new Date(),
    })
    .where(eq(erProjects.id, req.params.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: updated });
}

export async function deleteErProject(req, res) {
  const [deleted] = await db
    .delete(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .returning({ id: erProjects.id });

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(204).send();
}

export async function getErCollaboration(req, res) {
  const rows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const collaborators = await listCollaborators("er", project.id);
  const share = await getPublicShare("er", project.id);
  return res.json({
    collaborators,
    publicAccess: share?.publicAccess || "private",
    owner: { email: req.user.email, name: req.user.name || null },
  });
}

export async function addErCollaborator(req, res) {
  const rows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const parsed = addCollaboratorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  if (parsed.data.email.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({ message: "Owner already has access" });
  }

  const collaborator = await addCollaborator("er", project, parsed.data.email, parsed.data.permission);
  return res.status(201).json({ collaborator });
}

export async function updateErCollaborator(req, res) {
  const ownerRows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);
  if (!ownerRows[0]) {
    return res.status(404).json({ message: "Project not found" });
  }

  const parsed = updateCollaboratorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [updated] = await db
    .update(projectCollaborators)
    .set({ permission: parsed.data.permission, updatedAt: new Date() })
    .where(
      and(
        eq(projectCollaborators.id, req.params.collaboratorId),
        eq(projectCollaborators.projectType, "er"),
        eq(projectCollaborators.projectId, req.params.id),
      ),
    )
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Collaborator not found" });
  }

  return res.json({ collaborator: updated });
}

export async function removeErCollaborator(req, res) {
  const ownerRows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);
  if (!ownerRows[0]) {
    return res.status(404).json({ message: "Project not found" });
  }

  const [deleted] = await db
    .delete(projectCollaborators)
    .where(
      and(
        eq(projectCollaborators.id, req.params.collaboratorId),
        eq(projectCollaborators.projectType, "er"),
        eq(projectCollaborators.projectId, req.params.id),
      ),
    )
    .returning({ id: projectCollaborators.id });
  if (!deleted) {
    return res.status(404).json({ message: "Collaborator not found" });
  }

  return res.status(204).send();
}

export async function updateErPublicShare(req, res) {
  const rows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);
  const project = rows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const parsed = updatePublicShareSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const share = await upsertPublicShare("er", project.id, req.user.id, parsed.data.publicAccess);
  return res.json({ publicAccess: share.publicAccess });
}