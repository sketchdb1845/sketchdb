import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { sqlProjects } from "../db/schema.js";

export async function listSqlProjects(userId) {
  return db
    .select({
      id: sqlProjects.id,
      name: sqlProjects.name,
      sql: sqlProjects.sql,
      createdAt: sqlProjects.createdAt,
      updatedAt: sqlProjects.updatedAt,
    })
    .from(sqlProjects)
    .where(eq(sqlProjects.userId, userId))
    .orderBy(desc(sqlProjects.updatedAt));
}

export async function getSqlProjectById(userId, projectId) {
  const rows = await db
    .select()
    .from(sqlProjects)
    .where(and(eq(sqlProjects.id, projectId), eq(sqlProjects.userId, userId)))
    .limit(1);

  return rows[0] || null;
}

export async function createSqlProject(userId, name, sql) {
  const [created] = await db
    .insert(sqlProjects)
    .values({
      userId,
      name,
      sql,
    })
    .returning();

  return created;
}

export async function updateSqlProject(userId, projectId, updates) {
  const [updated] = await db
    .update(sqlProjects)
    .set({
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.sql ? { sql: updates.sql } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(sqlProjects.id, projectId), eq(sqlProjects.userId, userId)))
    .returning();

  return updated || null;
}

export async function deleteSqlProject(userId, projectId) {
  const [deleted] = await db
    .delete(sqlProjects)
    .where(and(eq(sqlProjects.id, projectId), eq(sqlProjects.userId, userId)))
    .returning({ id: sqlProjects.id });

  return deleted || null;
}