import mongoose from "mongoose";

const FacilitiesSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  library_facilities: { type: Boolean, default: false },
  computer_lab: { type: Boolean, default: false },
  medium_of_instruction: { 
    type: String, 
    enum: ["Hindi", "English", "Regional"], 
    default: "Regional" 
  }
});

export default mongoose.model("Facilities", FacilitiesSchema);
