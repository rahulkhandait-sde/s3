import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import School from "../models/School.js";
import multer from "multer";
import FundAllocation from "../models/FundAllocation.js";
import PaymentRequest from "../models/PaymentRequest.js";
import Module from "../models/Module.js";
import ExpenseDeductionRequest from "../models/ExpenseDeductionRequest.js";
import TaskCompletion from "../models/TaskCompletion.js";
import SubjectDemand from "../models/subjectDemandSchema.js";
import Feedback from "../models/Feedback.js";
const adminrouter = express.Router();

// Admin Login
adminrouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token, username: admin.username, role: "admin" });
});


// Admin Creates School
adminrouter.post("/create-school", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingSchools = await School.find();
        for (let school of existingSchools) {
            const isMatch = await bcrypt.compare(password, school.password);
            if (isMatch) {
                return res.status(400).json({ message: "A school with this password already exists" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSchool = new School({ username, password: hashedPassword });
        await newSchool.save();

        res.json({ message: "School created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/AdminReceipt/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Admin adding balance
adminrouter.post("/add-balance", upload.single('document'), async (req, res) => {
    try {
        const { udise_code, amount, addedBy } = req.body;
        const documentPath = req.file ? req.file.path : null;


        const school = await School.findOne({ udise_code }).populate("fund_allocation");
        if (!school) return res.status(404).json({ message: "School not found" });

        // Get or create FundAllocation for the school
        let fund = school.fund_allocation;
        if (!fund) {
            fund = new FundAllocation({ school: school._id });
            school.fund_allocation = fund._id;
        }

        // Update fund details
        fund.total_allocated_amount += parseFloat(amount);
        fund.current_remaining_amount += parseFloat(amount);

        // Add to payment history
        fund.payment_history.push({
            amount: parseFloat(amount),
            date: new Date(),
            document: documentPath,
            addedBy
        });

        await fund.save();
        await school.save();

        res.json({ message: "Balance added successfully!", fund });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




// Get All Payment Requests (Admin)
adminrouter.get("/payment-requests", async (req, res) => {
    try {
        const paymentRequests = await PaymentRequest.find().populate("school");
        res.json(paymentRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




// Approve or Reject Payment Request (Admin)
adminrouter.put("/payment-request/:id", async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;

        const paymentRequest = await PaymentRequest.findById(req.params.id);
        if (!paymentRequest) return res.status(404).json({ message: "Payment request not found" });

        if (status === "Approved") {
            paymentRequest.status = "Approved";
            paymentRequest.approval_date = new Date();
        } else if (status === "Rejected") {
            paymentRequest.status = "Rejected";
            paymentRequest.rejection_reason = rejection_reason;
            paymentRequest.rejection_date = new Date();
        } else {
            return res.status(400).json({ message: "Invalid status" });
        }

        await paymentRequest.save();
        res.json({ message: `Payment request ${status.toLowerCase()} successfully!`, paymentRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Upload Money Receipt (Admin)
adminrouter.put("/payment-request/:id/mark-paid", upload.single("receipt"), async (req, res) => {
    try {
        const paymentRequest = await PaymentRequest.findById(req.params.id);
        if (!paymentRequest) return res.status(404).json({ message: "Payment request not found" });

        paymentRequest.payment_status = "Paid";
        paymentRequest.payment_date = new Date();
        paymentRequest.money_receipt = req.file ? req.file.path : null;

        await paymentRequest.save();
        res.json({ message: "Payment marked as paid successfully!", paymentRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//to get all schools 

adminrouter.get("/schools", async (req, res) => {
    try {
        const schools = await School.find().populate([
            { path: "fund_allocation" }
        ]);

        if (schools.length === 0) {
            return res.status(404).json({ message: "No schools found" });
        }

        res.json(schools);
    } catch (error) {
        console.error("Error fetching school details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




//Create a new module with tasks
adminrouter.post("/create-module", async (req, res) => {
    try {
        const { moduleName, tasks } = req.body;

        if (!moduleName || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ message: "Module name and at least one task are required" });
        }

        const newModule = new Module({ moduleName, tasks });
        await newModule.save();

        res.status(201).json({ message: "Module created successfully", module: newModule });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// GET: View all modules with tasks
adminrouter.get("/modules", async (req, res) => {
    try {
        const modules = await Module.find();
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Update a module (module name or tasks)
adminrouter.put("/update-module/:moduleId", async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { moduleName, tasks } = req.body;

        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        if (moduleName) {
            module.moduleName = moduleName;
        }

        if (Array.isArray(tasks) && tasks.length > 0) {
            tasks.forEach((newTask) => {
                const existingTaskIndex = module.tasks.findIndex(
                    (task) => task._id.toString() === newTask._id
                );

                if (existingTaskIndex !== -1) {
                    module.tasks[existingTaskIndex] = { ...module.tasks[existingTaskIndex], ...newTask };
                } else {
                    module.tasks.push(newTask);
                }
            });
        }

        await module.save();
        res.status(200).json({ message: "Module updated successfully", module });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



adminrouter.post("/add-module", async (req, res) => {
    try {
        const { moduleName, addingDate } = req.body;

        console.log("Received data:", req.body);

        if (!moduleName) {
            return res.status(400).json({ message: "Module name is required" });
        }

        console.log("Creating new module...");

        const newModule = new Module({
            moduleName,
            tasks: [],
            createdAt: addingDate || new Date()
        });

        await newModule.save();
        res.status(201).json({ message: "Module added successfully", module: newModule });

    } catch (error) {
        console.error("Error adding module:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



// Admin deducting balance
adminrouter.post("/deduct-balance", async (req, res) => {
    try {
        const { udise_code, amount, addedBy } = req.body;

        // Find school by UDISE code
        const school = await School.findOne({ udise_code }).populate("fund_allocation");
        if (!school) return res.status(404).json({ message: "School not found" });

        // Get or create FundAllocation for the school
        let fund = school.fund_allocation;
        if (!fund) {
            fund = new FundAllocation({ school: school._id });
            school.fund_allocation = fund._id;
        }

        // Ensure sufficient balance before deducting
        if (fund.current_remaining_amount < parseFloat(amount)) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Update fund details
        fund.current_amount_used += parseFloat(amount);
        fund.current_remaining_amount -= parseFloat(amount);

        // Add to payment history
        fund.payment_history.push({
            amount: parseFloat(amount),
            date: new Date(),
            addedBy
        });

        await fund.save();
        await school.save();

        res.json({ message: "Balance deducted successfully!", fund });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});





// Get All Payment Requests (Admin)
adminrouter.get("/money-deduction-requests", async (req, res) => {
    try {
        const ExpenseDeductionRequests = await ExpenseDeductionRequest.find().populate("school");
        res.json(ExpenseDeductionRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




// Approve or Reject money-deduction-requests (Admin)
adminrouter.put("/money-deduction-requests/:id", async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;

        // Use a different variable name to prevent shadowing the model
        const expenseRequest = await ExpenseDeductionRequest.findById(req.params.id);
        if (!expenseRequest) {
            return res.status(404).json({ message: "Payment request not found" });
        }

        if (status === "Approved") {
            expenseRequest.status = "Approved";
            expenseRequest.approval_date = new Date();
        } else if (status === "Rejected") {
            expenseRequest.status = "Rejected";
            expenseRequest.rejection_reason = rejection_reason;
            expenseRequest.rejection_date = new Date();
        } else {
            return res.status(400).json({ message: "Invalid status" });
        }

        await expenseRequest.save();
        res.json({ message: `Payment request ${status.toLowerCase()} successfully!`, expenseRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});






// Admin route to update task submission status
adminrouter.put("/update-tasksubmision-status", async (req, res) => {
    try {
        const { taskId, adminStatus } = req.body;

        if (!taskId || !adminStatus) {
            return res.status(400).json({ message: "taskId and adminStatus are required." });
        }

        if (!["Approved", "Rejected"].includes(adminStatus)) {
            return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'." });
        }

        const updateFields = { adminStatus };
        if (adminStatus === "Approved") {
            updateFields.pointAllocationStatus = true;
            updateFields.totalPointsAllocated = 20;
        } else if (adminStatus === "Rejected") {
            updateFields.pointAllocationStatus = false;
        }

        const updatedTask = await TaskCompletion.findByIdAndUpdate(
            taskId,
            updateFields,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: `Task ${adminStatus} successfully`, updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Fetch all task completion requests
adminrouter.get('/task-completion-requests', async (req, res) => {
    try {
        const taskCompletionRequests = await TaskCompletion.find();
        res.status(200).json(taskCompletionRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task completion requests', error: error.message });
    }
});


adminrouter.get("/subject-demand", async (req, res) => {
    try {
        let schools = await SubjectDemand.find();

        // Calculate total teachers needed for each school
        schools = schools.map((school) => ({
            ...school._doc,
            totalTeachersNeeded: Object.values(school.demandData).reduce((acc, num) => acc + num, 0),
        }));

        // Sort: Rural (1) first, then Urban (2), and by total teachers needed (descending)
        schools.sort((a, b) => {
            if (a.ruralUrban !== b.ruralUrban) {
                return a.ruralUrban === "1" ? -1 : 1;
            }
            return b.totalTeachersNeeded - a.totalTeachersNeeded;
        });

        res.json({ success: true, schools });
    } catch (error) {
        console.error("Error fetching subject demand data:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});



// API: Get Feedbacks (For Admin Panel)
adminrouter.get("/getFeedbacks", async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching feedbacks", error });
    }
});

// API Endpoint to Get Only Feedback List
adminrouter.get("/feedbacks-list", async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}, "feedback -_id");
        const feedbackList = feedbacks.map((item) => item.feedback);
        res.json(feedbackList);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
export default adminrouter;
