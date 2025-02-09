import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredDocuments: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", TaskSchema);
