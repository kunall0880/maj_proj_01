import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "assigned", "submitted", "completed"],
      default: "open",
    },
    selectedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);


