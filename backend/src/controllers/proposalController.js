import { Proposal } from "../models/Proposal.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";

export const submitProposal = async (req, res) => {
  try {
    const { jobId, bidAmount, coverLetter } = req.body;
    if (!jobId || !bidAmount || !coverLetter) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(400).json({ message: "Job not open for proposals" });
    }

    const proposal = await Proposal.create({
      jobId,
      freelancerId: req.user._id,
      bidAmount,
      coverLetter,
    });

    return res.status(201).json(proposal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProposalsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const proposals = await Proposal.find({ jobId }).populate("freelancerId", "name email");
    return res.json(proposals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const selectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    const job = await Job.findById(proposal.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your job" });
    }

    job.status = "assigned";
    job.selectedFreelancer = proposal.freelancerId;
    proposal.status = "accepted";

    await job.save();
    await proposal.save();

    // Increment freelancer completedProjects later when job completes; here only assignment.
    const freelancer = await User.findById(proposal.freelancerId);
    return res.json({ job, proposal, freelancer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


