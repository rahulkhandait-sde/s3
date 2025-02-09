import mongoose from "mongoose";
const SubjectDemandSchema = new mongoose.Schema({
  udiseId: { type: String, required: true, unique: true },
  demandData: { type: Object, required: true },
  ruralUrban: { type: String, required: true }, 
});

export default mongoose.model("SubjectDemand", SubjectDemandSchema);
