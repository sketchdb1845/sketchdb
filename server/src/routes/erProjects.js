import express from "express";
import {
  addErCollaborator,
  createErProject,
  deleteErProject,
  getErCollaboration,
  getErProject,
  getPublicErProject,
  listErProjects,
  removeErCollaborator,
  updateErCollaborator,
  updateErPublicShare,
  updateErProject,
} from "../controllers/erProjects.controller.js";

const router = express.Router();

router.get("/", listErProjects);
router.get("/public/:id", getPublicErProject);
router.get("/:id", getErProject);
router.get("/:id/collaboration", getErCollaboration);
router.post("/", createErProject);
router.post("/:id/collaborators", addErCollaborator);
router.put("/:id/collaborators/:collaboratorId", updateErCollaborator);
router.delete("/:id/collaborators/:collaboratorId", removeErCollaborator);
router.put("/:id/public-share", updateErPublicShare);
router.put("/:id", updateErProject);
router.delete("/:id", deleteErProject);

export default router;
