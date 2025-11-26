import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import {
  getProposalsForJob,
  selectProposal,
  submitProposal,
} from "../controllers/proposalController.js";

const router = express.Router();

// Freelancer submits proposal
router.post("/submit", requireRole("freelancer"), submitProposal);

// Client views proposals for a job
router.get("/job/:jobId", requireRole("client"), getProposalsForJob);

// Client selects proposal
router.put("/select/:proposalId", requireRole("client"), selectProposal);

export default router;


