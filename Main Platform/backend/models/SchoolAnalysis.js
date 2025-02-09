import mongoose from "mongoose";

const SchoolAnalysisSchema = new mongoose.Schema({
    udise_id: {
        type: Number,
        required: true,
        unique: true
    },
    standardization_percentage: {
        type: Number,
        required: true
    },
    google_map_location: { 
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Export the model
export default mongoose.model('SchoolAnalysis', SchoolAnalysisSchema);
