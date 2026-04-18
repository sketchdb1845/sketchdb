import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { erProjects } from "../db/schema.js";

export async function listErProjects(userId) {
  return db
    .select({
      id: erProjects.id,
      name: erProjects.name,
      erJson: erProjects.erJson,
      createdAt: erProjects.createdAt,
      updatedAt: erProjects.updatedAt,
    })
    .from(erProjects)
    .where(eq(erProjects.userId, userId))
    .orderBy(desc(erProjects.updatedAt));
}

export async function getErProjectById(userId, projectId) {
  const rows = await db
    .select()
    .from(erProjects)
    .where(and(eq(erProjects.id, projectId), eq(erProjects.userId, userId)))
    .limit(1);

  return rows[0] || null;
}

export async function createErProject(userId, name, erJson) {
  const [created] = await db
    .insert(erProjects)
    .values({
      userId,
      name,
      erJson,
    })
    .returning();

  return created;
}

export async function updateErProject(userId, projectId, updates) {
  const [updated] = await db
    .update(erProjects)
    .set({
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.erJson ? { erJson: updates.erJson } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(erProjects.id, projectId), eq(erProjects.userId, userId)))
    .returning();

  return updated || null;
}

export async function deleteErProject(userId, projectId) {
  const [deleted] = await db
    .delete(erProjects)
    .where(and(eq(erProjects.id, projectId), eq(erProjects.userId, userId)))
    .returning({ id: erProjects.id });

  return deleted || null;
}