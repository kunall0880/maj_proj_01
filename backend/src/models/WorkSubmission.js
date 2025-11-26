import mongoose from "mongoose";

const workSubmissionSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submittedFiles: [{ type: String }],
    submissionMessage: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WorkSubmission = mongoose.model("WorkSubmission", workSubmissionSchema);


