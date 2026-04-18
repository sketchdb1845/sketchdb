import express from "express";
import { z } from "zod";
import {
  createErProject,
  deleteErProject,
  getErProjectById,
  listErProjects,
  updateErProject,
} from "../controllers/erProjects.controller.js";

const router = express.Router();

const createErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150),
  erJson: z.string().trim().min(1),
});

const updateErProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  erJson: z.string().trim().min(1).optional(),
});

router.get("/", async (req, res) => {
  const projects = await listErProjects(req.user.id);
  return res.json({ projects });
});

router.get("/:id", async (req, res) => {
  const project = await getErProjectById(req.user.id, req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project });
});

router.post("/", async (req, res) => {
  const parsed = createErProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const created = await createErProject(req.user.id, parsed.data.name, parsed.data.erJson);

  return res.status(201).json({ project: created });
});

router.put("/:id", async (req, res) => {
  const parsed = updateErProjectSchema.safeParse(req.body);
  if (!parsed.success || (!parsed.data.name && !parsed.data.erJson)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const updated = await updateErProject(req.user.id, req.params.id, {
    ...(parsed.data.name ? { name: parsed.data.name } : {}),
    ...(parsed.data.erJson ? { erJson: parsed.data.erJson } : {}),
  });

  if (!updated) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json({ project: updated });
});

router.delete("/:id", async (req, res) => {
  const deleted = await deleteErProject(req.user.id, req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.status(204).send();
});

export default router;
