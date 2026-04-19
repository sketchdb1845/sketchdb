import express from "express";
import {
  createErProject,
  deleteErProject,
  getErProject,
  listErProjects,
  updateErProject,
} from "../controllers/erProjects.controller.js";

const router = express.Router();

router.get("/", listErProjects);
router.get("/:id", getErProject);
router.post("/", createErProject);
router.put("/:id", updateErProject);
router.delete("/:id", deleteErProject);

export default router;
