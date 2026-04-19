import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { erProjects } from "../db/schema.js";

const createErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  erJson: z.string().trim().min(1),
});

const updateErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  erJson: z.string().trim().min(1).optional(),
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
  const rows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
    .limit(1);

  if (!rows[0]) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: rows[0] });
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

  const [updated] = await db
    .update(erProjects)
    .set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.erJson ? { erJson: parsed.data.erJson } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(erProjects.id, req.params.id), eq(erProjects.userId, req.user.id)))
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