import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    userType: { type: String, enum: ["Student", "Teacher", "Parent"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    feedback: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", FeedbackSchema);

