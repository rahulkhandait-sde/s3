import mongoose from "mongoose";

const ExpenseDeductionReqSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    udise_code: { type: String, required: true },
    amount: { type: Number, required: true },
    supporting_document: { type: String, required: true }, 
    description: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejection_reason: { type: String, default: null },
    rejection_date: { type: Date, default: null },
    approval_date: { type: Date, default: null },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }, 
}, { timestamps: true });

export default mongoose.model("ExpenseDeductionRequest", ExpenseDeductionReqSchema);
