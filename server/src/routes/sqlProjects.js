import express from "express";
import {
  addSqlCollaborator,
  createSqlProject,
  deleteSqlProject,
  getPublicSqlProject,
  getSqlCollaboration,
  getSqlProject,
  listSqlProjects,
  removeSqlCollaborator,
  updateSqlCollaborator,
  updateSqlPublicShare,
  updateSqlProject,
} from "../controllers/sqlProjects.controller.js";

const router = express.Router();

router.get("/", listSqlProjects);
router.get("/public/:id", getPublicSqlProject);
router.get("/:id", getSqlProject);
router.get("/:id/collaboration", getSqlCollaboration);
router.post("/", createSqlProject);
router.post("/:id/collaborators", addSqlCollaborator);
router.put("/:id/collaborators/:collaboratorId", updateSqlCollaborator);
router.delete("/:id/collaborators/:collaboratorId", removeSqlCollaborator);
router.put("/:id/public-share", updateSqlPublicShare);
router.put("/:id", updateSqlProject);
router.delete("/:id", deleteSqlProject);

export default router;
