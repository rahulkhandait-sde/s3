import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import schoolrouter from "./routes/schoolRoutes.js";
import adminrouter from "./routes/adminRoutes.js";
import Admin from "./models/Admin.js"; 
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
connectDB()
  .then(() => createAdminIfNotExists()) 
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const createAdminIfNotExists = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "admin123" });

    if (existingAdmin) {
      console.log("ℹ️ Admin already exists, skipping creation.");
      return;
    }

    const hashedPassword = await bcrypt.hash("adminpass", 10);
    const admin = new Admin({
      username: "admin123",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

app.use("/api/admin", adminrouter);
app.use("/api/school", schoolrouter);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));

