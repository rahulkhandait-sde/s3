import mongoose from "mongoose";

const SchoolTaskSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  status: { type: String, enum: ["Pending", "Submitted", "Approved", "Rejected"], default: "Pending" },
  uploadedDocuments: { type: [String], default: [] },
  completionDescription: { type: String, default: "" },
  adminRemarks: { type: String, default: "" },
  submittedAt: { type: Date },
  reviewedAt: { type: Date }
});

export default mongoose.model("SchoolTask", SchoolTaskSchema);
