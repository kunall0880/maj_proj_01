import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  updateJob,
} from "../controllers/jobController.js";

const router = express.Router();

// Client creates job
router.post("/create", requireRole("client"), createJob);

// All authenticated users can view jobs
router.get("/all", getAllJobs);
router.get("/:id", getJobById);

// Client updates or deletes own job
router.put("/update/:id", requireRole("client"), updateJob);
router.delete("/:id", requireRole("client"), deleteJob);

export default router;


