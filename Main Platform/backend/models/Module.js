import mongoose from "mongoose";
const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    taskDescription: { type: String, required: true },
    taskCompletionPoint: { type: Number, required: true },
    addingDate: { type: Date, default: Date.now },
    verificationDocumentsRequired: { type: String, required: true }
});

const ModuleSchema = new mongoose.Schema({
    moduleName: { type: String, required: true, unique: true }, 
    tasks: [TaskSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Module", ModuleSchema);
