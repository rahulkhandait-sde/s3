# AI-Powered School Standardization Platform

## Overview
Our AI-driven platform aims to streamline school standardization processes by leveraging advanced machine learning, natural language processing, and dynamic resource allocation. This project is designed to support educational policymakers, administrators, and school authorities in restructuring and optimizing their institutions based on best practices.

## Key Features
### 1. **AI-Powered School Structure Optimization System**
   - Analyzes school infrastructure and available resources.
   - Suggests optimal grade reconfiguration models for better alignment with standard categories.
   - Provides a school standardization score and improvement recommendations.

### 2. **AI-Based Smart Teacher Allocation**
   - Assesses subject-wise teacher demand for each school.
   - Generates automated reports on teacher distribution needs.
   - Prioritizes rural development needs for better resource allocation.

### 3. **NLP-Based Stakeholder Feedback Analysis**
   - Collects feedback from students, teachers, and school administrators.
   - Utilizes AI to analyze feedback and generate policy improvement suggestions.
   - Provides an intuitive dashboard for administrators to review feedback insights.

### 4. **Progress Monitoring Dashboard**
   - Tracks schools’ progress in adopting standard structures.
   - Identifies bottlenecks and suggests real-time interventions.

### 5. **Interactive Stakeholder Engagement Portal**
   - Enables discussions, feedback submission, and resource-sharing.
   - Provides forums and community support for smooth transition management.

### 6. **Admin-Side Features**
   - **Login** for administrators.
   - **Create & manage schools** with credentials.
   - **Search schools** by UDISE ID and view details.
   - **Add new features** to educational schemes as tasks.
   - **View policy improvement suggestions** from AI-based feedback analysis.
   - **Manage school funding requests** based on priority and proof submission.
   - **Allocate teachers dynamically** based on demand and region priorities.
   - **Automated email feedback collection** using Orkes for biweekly insights.

---

## Tech Stack
We have used the following technologies to build this platform:
- **Frontend:** Next.js, TypeScript, TailwindCSS, ShadCN UI, React Hook Form
- **Backend:** NextAuth, OpenAI, MongoDB, Zod
- **Email Automation:** Orkes

---

## Installation & Usage
### **Step 1: Clone the Repository**
```sh
 git clone https://github.com/rahulkhandait-sde/s3.git
 cd s3
```

### **Step 2: Set Up Virtual Environment**
We recommend using a virtual environment:
```sh
 python -m venv venv
 source venv/bin/activate  # On Mac/Linux
 venv\Scripts\activate     # On Windows
```

### **Step 3: Install Dependencies**
```sh
 pip install -r requirements.txt
```

### **Step 4: Run the Flask Server**
```sh
 python app.py
```

### **Step 5: Start the Express Backend**
```sh
 cd backend
 npm install
 npm start
```

### **Step 6: Start the Next.js Frontend**
```sh
 cd frontend
 npm install
 npm run dev
```

### **Step 7: Access the Dashboard**
Once all servers are up, visit:
- **Admin Panel:** `http://localhost:3000/admin`
- **School Dashboard:** `http://localhost:3000/schools`

---

## How to Use
### **For Schools**
1. Log in to the school dashboard.
2. Enter school infrastructure details in the **Standardization Section**.
3. Submit details to receive a **Standardization Score & Recommendations**.
4. Upload **teacher availability data** to generate teacher demand reports.
5. Provide **feedback on policies** via the portal.
6. Request **funding support** with necessary proof for admin review.

### **For Administrators**
1. Log in to the **Admin Dashboard**.
2. Search schools using **UDISE ID** to view details.
3. Assign tasks related to **educational schemes**.
4. Approve or reject **funding requests** based on verification.
5. Monitor **teacher demand reports** and allocate resources accordingly.
6. Analyze **stakeholder feedback** using AI-powered insights.

---

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-branch-name`).
3. Commit changes and push them to your fork.
4. Create a Pull Request for review.

---

## License
This project is licensed under the [MIT License](LICENSE).
