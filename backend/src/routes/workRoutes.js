import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { approveWork, getWorkForJob, submitWork } from "../controllers/workController.js";

const router = express.Router();

// Freelancer submits work
router.post("/submit", requireRole("freelancer"), submitWork);

// Client or assigned freelancer views submissions for job
router.get("/job/:id", getWorkForJob);

// Client approves work
router.put("/approve/:id", requireRole("client"), approveWork);

export default router;


