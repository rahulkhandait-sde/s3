import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import School from "../models/School.js";
import fs from "fs";
import FundAllocation from "../models/FundAllocation.js";
import multer from "multer";
import PaymentRequest from "../models/PaymentRequest.js";
import Module from "../models/Module.js";
import TaskCompletion from "../models/TaskCompletion.js";
import ExpenseDeductionRequest from "../models/ExpenseDeductionRequest.js";
import AiStandardizationRecord from "../models/AiStandardizationRecord.js";
import SubjectDemand from "../models/subjectDemandSchema.js";
import Feedback from "../models/Feedback.js";
const schoolrouter = express.Router();

// School Login
schoolrouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const school = await School.findOne({ username })
        .populate("fund_allocation");

    if (!school || !(await bcrypt.compare(password, school.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: school._id, role: "school" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        token,
        school: {
            username: school.username,
            name: school.name,
            district: school.district,
            location: school.location,
            udise_code: school.udise_code,
            total_students: school.total_students,
            total_teachers: school.total_teachers,
            total_staff: school.total_staff,
            grade_configuration: school.grade_configuration,
            students_per_grade: school.students_per_grade,
            standardization_percentage: school.standardization_percentage,
            createdAt: school.createdAt,
            lastUpdated: school.lastUpdated,
            fund_allocation: school.fund_allocation || {}
        },
        role: "school"
    });
});

schoolrouter.get("/profile", async (req, res) => {
  try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const school = await School.findById(decoded.id)
          .populate("fund_allocation");

      if (!school) return res.status(404).json({ message: "School not found" });

      res.json(school);
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});


schoolrouter.put("/update", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const school = await School.findById(decoded.id);

        if (!school) return res.status(404).json({ message: "School not found" });

       
        const updateData = req.body;
        let isUpdated = false;

        for (const key in updateData) {
            if (!school[key] || school[key] === "" || school[key] !== updateData[key]) {
                school[key] = updateData[key];
                isUpdated = true;
            }
        }

        if (!isUpdated) {
            return res.status(400).json({ message: "No new data to update" });
        }

        school.lastUpdated = new Date(); 
        await school.save();

        res.json({ message: "School details updated successfully", school });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



const dir = 'uploads/PaymentReqSuppportingdoc/';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix); 
    }
});

const upload = multer({ storage: storage });

// Create Payment Request (School Side)
schoolrouter.post("/request-payment", upload.single("document"), async (req, res) => {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

    
        const { amount } = req.body;
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: "Invalid or missing amount" });
        }

        const documentPath = req.file ? req.file.path : null;

        const paymentRequest = new PaymentRequest({
            school: school._id,
            udise_code: school.udise_code,
            amount: parseFloat(amount),
            supporting_document: documentPath,
            status: "Pending"
        });

        await paymentRequest.save();

        res.json({ message: "Payment request submitted successfully!", paymentRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



// Get Payment Requests for the School
schoolrouter.get("/payment-requests", async (req, res) => {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        
        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

        const paymentRequests = await PaymentRequest.find({ school: schoolId });

        if (paymentRequests.length === 0) {
            return res.status(404).json({ message: "No payment requests found for this school" });
        }

        res.json({
            message: "Payment requests fetched successfully",
            paymentRequests: paymentRequests.map(request => ({
                _id: request._id,
                udise_code: request.udise_code,
                amount: request.amount,
                status: request.status,
                supporting_document: request.supporting_document,
                rejection_reason: request.rejection_reason,
                approval_date: request.approval_date,
                payment_status: request.payment_status,
                payment_date: request.payment_date,
                money_receipt: request.money_receipt,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




schoolrouter.get("/modules", async (req, res) => {
    try {
        const modules = await Module.find().populate("tasks"); // Fetch all modules along with tasks
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


//expence deduction request 
const dir2 = "uploads/ExpancedeductionReqSuppportingdoc/";
if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2, { recursive: true });
}

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir2); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, uniqueSuffix); 
    }
});
const upload2 = multer({ storage: storage2 });

// Create Expense Deduction Request (School Side)
schoolrouter.post("/request-expense-deduction", upload2.single("document"), async (req, res) => {
    try {
       
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

        const { amount, description } = req.body;
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "Invalid or missing amount" });
        }

        const documentPath = req.file ? req.file.path : null;

        const expenseRequest = new ExpenseDeductionRequest({
            school: school._id,
            udise_code: school.udise_code,
            amount: parseFloat(amount),
            description,
            supporting_document: documentPath,
            status: "Pending" 
        });

        await expenseRequest.save();

        res.json({
            message: "Expense deduction request submitted successfully!",
            expenseRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



schoolrouter.get("/expense-requests", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

        const expenseRequests = await ExpenseDeductionRequest.find({ school: schoolId }).sort({ createdAt: -1 });

        res.json({
            message: "Expense deduction requests fetched successfully",
            expenseRequests: expenseRequests.map(request => ({
                _id: request._id,
                udise_code: request.udise_code,
                amount: request.amount,
                status: request.status,
                supporting_document: request.supporting_document,
                rejection_reason: request.rejection_reason,
                rejection_date: request.rejection_date,
                approval_date: request.approval_date,
                approved_by: request.approved_by,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });

    } catch (error) {
        console.error("Error fetching expense requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



// School side API to submit task completion
const storage3 = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/TaskcompletionReqSuppportingdoc/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload3 = multer({ storage: storage3 });

schoolrouter.post("/submit-task", upload3.single("supportingDocument"), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

        const { moduleName, taskName, description, expenses, challengesFaced, problemSolvingApproach } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Supporting document is required" });
        }

        const newTask = new TaskCompletion({
            udise_code: school.udise_code,
            moduleName,
            taskName,
            supportingDocument: req.file.path, 
            description,
            expenses,
            challengesFaced,
            problemSolvingApproach,
            adminStatus: "Pending", 
            pointAllocationStatus: false, 
            totalPointsAllocated: 0 
        });

        await newTask.save();

        res.status(201).json({
            message: "Task completion request submitted successfully",
            newTask
        });

    } catch (error) {
        console.error("Error submitting task completion:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


schoolrouter.get("/get-submited-tasks", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const schoolId = decoded.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: "School not found" });

        const tasks = await TaskCompletion.find({ udise_code: school.udise_code });

        if (!tasks.length) {
            return res.status(404).json({ message: "No task completion records found for this school" });
        }

        res.status(200).json({
            message: "Task completion records fetched successfully",
            tasks
        });

    } catch (error) {
        console.error("Error fetching task completion records:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Fetch all modules and count total tasks across modules
schoolrouter.get("/total-tasks", async (req, res) => {
    try { 
        const modules = await Module.find();
        const totalTasks = modules.reduce((count, module) => count + module.tasks.length, 0);
        res.json({ totalTasks });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//fetch all approved tasks count for a given UDISE code
schoolrouter.get("/approved-tasks/:udise_code", async (req, res) => {
    try {
        const { udise_code } = req.params;
        
        const approvedTasksCount = await TaskCompletion.countDocuments({ 
            udise_code, 
            adminStatus: "Approved" 
        });
        
        res.json({ udise_code, approvedTasksCount });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// POST: Store or update school analysis data
schoolrouter.post('/school-analysis', async (req, res) => {
    try {
        const { udise_id, standardization_percentage, google_map_location } = req.body;

        let schoolAnalysis = await AiStandardizationRecord.findOne({ udise_id });

        if (schoolAnalysis) {
            AiStandardizationRecord.standardization_percentage = standardization_percentage;
            AiStandardizationRecord.google_map_location = google_map_location;
            AiStandardizationRecord.updatedAt = Date.now();
        } else {
            schoolAnalysis = new AiStandardizationRecord({
                udise_id,
                standardization_percentage,
                google_map_location
            });
        }

        await schoolAnalysis.save();
        res.status(200).json({ message: 'School analysis data saved successfully', data: schoolAnalysis });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET: Retrieve all school analysis records
schoolrouter.get('/school-analysis', async (req, res) => {
    try {
        const schoolAnalysisData = await AiStandardizationRecord.find();
        res.status(200).json(schoolAnalysisData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET: Retrieve a specific school analysis record by UDISE ID
schoolrouter.get('/school-analysis/:udise_id', async (req, res) => {
    try {
        const { udise_id } = req.params;
        const schoolAnalysis = await SchoolAnalysis.findOne({ udise_id });

        if (!schoolAnalysis) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.status(200).json(schoolAnalysis);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// Store or update subject demand data
schoolrouter.post("/subject-demand", async (req, res) => {
  try {
    const { udiseId, demandData, ruralUrban } = req.body;

    if (!udiseId || !demandData || !ruralUrban) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    let existingRecord = await SubjectDemand.findOne({ udiseId });

    if (existingRecord) {
      existingRecord.demandData = demandData;
      existingRecord.ruralUrban = ruralUrban; // Store Rural/Urban data
      await existingRecord.save();
    } else {
      await SubjectDemand.create({ udiseId, demandData, ruralUrban });
    }

    res.json({ success: true, message: "Teacher demand data stored successfully." });
  } catch (error) {
    console.error("Error saving teacher demand:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});




// API: Submit Feedback
schoolrouter.post("/submitFeedback", async (req, res) => {
    try {
        const { userType, name, email, feedback } = req.body;
        const newFeedback = new Feedback({ userType, name, email, feedback });
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting feedback", error });
    }
});





export default schoolrouter;
