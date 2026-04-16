import express from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";

const router = express.Router();

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  sql: z.string().trim().min(1),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  sql: z.string().trim().min(1).optional(),
});

router.get("/", async (req, res) => {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      sql: projects.sql,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.userId, req.user.id))
    .orderBy(desc(projects.updatedAt));

  return res.json({ projects: rows });
});

router.get("/:id", async (req, res) => {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.user.id)))
    .limit(1);

  if (!rows[0]) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: rows[0] });
});

router.post("/", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [created] = await db
    .insert(projects)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      sql: parsed.data.sql,
    })
    .returning();

  return res.status(201).json({ project: created });
});

router.put("/:id", async (req, res) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.name && !parsed.data.sql)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const [updated] = await db
    .update(projects)
    .set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.sql ? { sql: parsed.data.sql } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.user.id)))
    .returning();

  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: updated });
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.user.id)))
    .returning({ id: projects.id });

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(204).send();
});

export default router;
