import express from "express";
import { authProxy, getSession, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/session", getSession);
router.post("/logout", logout);
router.use(authProxy);

export default router;