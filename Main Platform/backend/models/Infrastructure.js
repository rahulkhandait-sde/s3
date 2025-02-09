import mongoose from "mongoose";

const InfrastructureSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  infrastructure_status: { 
    type: String, 
    enum: ["Good", "Needs Improvement", "Poor"], 
    default: "Needs Improvement" 
  },
  electricity_availability: { type: Boolean, default: false },
  internet_availability: { type: Boolean, default: false },
  toilet_facilities: { 
    type: String, 
    enum: ["Boys", "Girls", "Common", "None"], 
    default: "None" 
  },
  playground_availability: { type: Boolean, default: false }
});

export default mongoose.model("Infrastructure", InfrastructureSchema);
