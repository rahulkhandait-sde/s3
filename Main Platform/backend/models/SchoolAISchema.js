import mongoose from "mongoose";

const SchoolAISchema = new mongoose.Schema({
  udise_code: { 
    type: String, 
    required: true, 
    unique: true, 
    ref: "School" 
  },
  recommendations: [{ type: String, default: [] }], 
  standardization_percentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("SchoolAI", SchoolAISchema);
