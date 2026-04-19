import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { sqlProjects } from "../db/schema.js";

const createSqlProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  sql: z.string().trim().min(1),
});

const updateSqlProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  sql: z.string().trim().min(1).optional(),
});

export async function listSqlProjects(req, res) {
  const rows = await db
    .select({
      id: sqlProjects.id,
      name: sqlProjects.name,
      sql: sqlProjects.sql,
      createdAt: sqlProjects.createdAt,
      updatedAt: sqlProjects.updatedAt,
    })
    .from(sqlProjects)
    .where(eq(sqlProjects.userId, req.user.id))
    .orderBy(desc(sqlProjects.updatedAt));

  return res.json({ projects: rows });
}

export async function getSqlProject(req, res) {
  const rows = await db
    .select()
    .from(sqlProjects)
    .where(and(eq(sqlProjects.id, req.params.id), eq(sqlProjects.userId, req.user.id)))
    .limit(1);

  if (!rows[0]) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: rows[0] });
}

export async function createSqlProject(req, res) {
  const parsed = createSqlProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [created] = await db
    .insert(sqlProjects)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      sql: parsed.data.sql,
    })
    .returning();

  return res.status(201).json({ project: created });
}

export async function updateSqlProject(req, res) {
  const parsed = updateSqlProjectSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.name && !parsed.data.sql)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [updated] = await db
    .update(sqlProjects)
    .set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.sql ? { sql: parsed.data.sql } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(sqlProjects.id, req.params.id), eq(sqlProjects.userId, req.user.id)))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: updated });
}

export async function deleteSqlProject(req, res) {
  const [deleted] = await db
    .delete(sqlProjects)
    .where(and(eq(sqlProjects.id, req.params.id), eq(sqlProjects.userId, req.user.id)))
    .returning({ id: sqlProjects.id });

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(204).send();
}