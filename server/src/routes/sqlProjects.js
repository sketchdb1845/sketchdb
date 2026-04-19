import express from "express";
import {
  createSqlProject,
  deleteSqlProject,
  getSqlProject,
  listSqlProjects,
  updateSqlProject,
} from "../controllers/sqlProjects.controller.js";

const router = express.Router();

router.get("/", listSqlProjects);
router.get("/:id", getSqlProject);
router.post("/", createSqlProject);
router.put("/:id", updateSqlProject);
router.delete("/:id", deleteSqlProject);

export default router;
