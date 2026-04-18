import express from "express";
import { z } from "zod";
import {
  createSqlProject,
  deleteSqlProject,
  getSqlProjectById,
  listSqlProjects,
  updateSqlProject,
} from "../controllers/sqlProjects.controller.js";

const router = express.Router();

const createSqlProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  sql: z.string().trim().min(1),
});

const updateSqlProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  sql: z.string().trim().min(1).optional(),
});

router.get("/", async (req, res) => {
  const projects = await listSqlProjects(req.user.id);
  return res.json({ projects });
});

router.get("/:id", async (req, res) => {
  const project = await getSqlProjectById(req.user.id, req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project });
});

router.post("/", async (req, res) => {
  const parsed = createSqlProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const created = await createSqlProject(req.user.id, parsed.data.name, parsed.data.sql);

  return res.status(201).json({ project: created });
});

router.put("/:id", async (req, res) => {
  const parsed = updateSqlProjectSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.name && !parsed.data.sql)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const updated = await updateSqlProject(req.user.id, req.params.id, {
    ...(parsed.data.name ? { name: parsed.data.name } : {}),
    ...(parsed.data.sql ? { sql: parsed.data.sql } : {}),
  });

  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: updated });
});

router.delete("/:id", async (req, res) => {
  const deleted = await deleteSqlProject(req.user.id, req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(204).send();
});

export default router;
