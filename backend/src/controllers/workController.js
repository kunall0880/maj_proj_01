import { WorkSubmission } from "../models/WorkSubmission.js";
import { Job } from "../models/Job.js";

export const submitWork = async (req, res) => {
  try {
    const { jobId, submittedFiles, submissionMessage } = req.body;
    if (!jobId || !submissionMessage) {
      return res.status(400).json({ message: "jobId and submissionMessage are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.selectedFreelancer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not assigned to this job" });
    }

    const work = await WorkSubmission.create({
      jobId,
      freelancerId: req.user._id,
      submittedFiles: submittedFiles || [],
      submissionMessage,
    });

    job.status = "submitted";
    await job.save();

    return res.status(201).json(work);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWorkForJob = async (req, res) => {
  try {
    const { id } = req.params; // jobId
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const isClient = job.clientId.toString() === req.user._id.toString();
    const isFreelancer =
      job.selectedFreelancer && job.selectedFreelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: "Not authorized to view this work" });
    }

    const submissions = await WorkSubmission.find({ jobId: id }).sort({ createdAt: -1 });
    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const approveWork = async (req, res) => {
  try {
    const { id } = req.params; // workSubmission id
    const work = await WorkSubmission.findById(id);
    if (!work) return res.status(404).json({ message: "Work submission not found" });

    const job = await Job.findById(work.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the client can approve work" });
    }

    work.approved = true;
    await work.save();

    job.status = "completed";
    await job.save();

    return res.json({ message: "Work approved", work, job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


