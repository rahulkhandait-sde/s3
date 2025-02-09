import mongoose from "mongoose";

const AiStandardizationRecordSchema = new mongoose.Schema(
  {
    udise_id: { type: String, required: true }, 
    standardization_percentage: { type: Number, required: true }, 
    google_map_location: { type: String, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("AiStandardizationRecord", AiStandardizationRecordSchema);
