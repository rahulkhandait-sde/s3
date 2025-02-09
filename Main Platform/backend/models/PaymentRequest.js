import mongoose from "mongoose";

const PaymentRequestSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    udise_code: { type: String, required: true },
    amount: { type: Number, required: true },
    supporting_document: { type: String }, 
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejection_reason: { type: String, default: null },
    rejection_date: { type: Date, default: null },
    approval_date: { type: Date, default: null },
    payment_status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
    payment_date: { type: Date, default: null },
    money_receipt: { type: String } 
}, { timestamps: true });

export default mongoose.model("PaymentRequest", PaymentRequestSchema);
