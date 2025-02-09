import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 

  name: { type: String, default: "Not Provided" },
  district: { type: String, default: "Not Provided" },
  location: { type: String, default: "Not Provided" },
  udise_code: { 
    type: String, 
    unique: true, 
    sparse: true, 
    default: function() { return `UDISE-${Date.now()}`; } 
  }
  ,
  total_students: { type: Number, default: 0 },
  total_teachers: { type: Number, default: 0 },
  total_staff: { type: Number, default: 0 },
  grade_configuration: { 
    type: String, 
    enum: ["1-5", "1-8", "1-10", "1-12"],
    default: "1-12" 
  },
  students_per_grade: { type: Map, of: Number, default: {} },
  standardization_percentage: { type: Number, default: 0 },
  fund_allocation: { type: mongoose.Schema.Types.ObjectId, ref: "FundAllocation", default: null },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("School", SchoolSchema);
