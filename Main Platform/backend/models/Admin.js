import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

export default mongoose.model("Admin", adminSchema);
