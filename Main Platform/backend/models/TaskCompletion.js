import mongoose from "mongoose";

const TaskCompletionSchema = new mongoose.Schema({
    udise_code: {
        type: String,
        required: true,
        ref: "School"
    },
    moduleName: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    supportingDocument: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    expenses: {
        type: Number,
        required: true
    },
    challengesFaced: {
        type: String,
        required: true
    },
    problemSolvingApproach: {
        type: String,
        required: true
    },
    adminStatus: {
        type: String,
        enum: ["Rejected", "Approved", "Pending"],
        default: "Pending"
    },
    pointAllocationStatus: {
        type: Boolean,
        default: false
    },
    totalPointsAllocated: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("TaskCompletion", TaskCompletionSchema);
