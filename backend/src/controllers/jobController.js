import { Job } from "../models/Job.js";

export const createJob = async (req, res) => {
  try {
    const { title, description, budget, category } = req.body;
    if (!title || !description || !budget || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await Job.create({
      clientId: req.user._id,
      title,
      description,
      budget,
      category,
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your job" });
    }

    const { title, description, budget, category, status } = req.body;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (budget !== undefined) job.budget = budget;
    if (category !== undefined) job.category = category;
    if (status !== undefined) job.status = status;

    await job.save();
    return res.json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your job" });
    }

    await job.deleteOne();
    return res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


