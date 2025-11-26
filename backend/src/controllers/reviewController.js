import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";

export const addReview = async (req, res) => {
  try {
    const { jobId, reviewedUser, rating, comment } = req.body;
    if (!jobId || !reviewedUser || !rating) {
      return res.status(400).json({ message: "jobId, reviewedUser and rating are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Basic check: allow only client or freelancer related to the job to review
    const isClient = job.clientId.toString() === req.user._id.toString();
    const isFreelancer =
      job.selectedFreelancer && job.selectedFreelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: "Not allowed to review for this job" });
    }

    const review = await Review.create({
      jobId,
      reviewerId: req.user._id,
      reviewedUser,
      rating,
      comment,
    });

    // Update reviewed user's rating as average
    const stats = await Review.aggregate([
      { $match: { reviewedUser: review.reviewedUser } },
      { $group: { _id: "$reviewedUser", avgRating: { $avg: "$rating" } } },
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(review.reviewedUser, {
        rating: stats[0].avgRating,
      });
    }

    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsForUser = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ reviewedUser: id })
      .populate("reviewerId", "name email")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


