import mongoose from "mongoose";

const PaymentHistorySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    document: { type: String }, 
    addedBy: { type: String, required: true } 
});

const FundAllocationSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    allocation_date: { type: Date, default: Date.now },
    total_allocated_amount: { type: Number, default: 0 },
    current_amount_used: { type: Number, default: 0 },
    current_remaining_amount: { type: Number, default: 0 },
    payment_history: [PaymentHistorySchema] 
});

export default mongoose.model("FundAllocation", FundAllocationSchema);
