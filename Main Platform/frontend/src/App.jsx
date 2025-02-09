import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import SchoolsData from "./pages/Schoolsdata";
import TaskManager from "./pages/Taskmanager";
import Tasks from "./pages/Tasks";
import SchoolTaskManagement from "./pages/SchoolTaskManagement";
import AdminTaskApproval from "./pages/AdminTaskApproval";
import SchoolAnalysisForm from "./pages/Analysis";
import InstitutionForm from "./pages/InstitutionForm";
import TeacherAllocation from "./pages/TeacherAllocation";
import AdminFeedback from "./pages/FeedbackAnalysis";
import FeedbackForm from "./pages/Feedback";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const currentTime = Math.floor(Date.now() / 1000);
      if (parsedUser.exp && parsedUser.exp > currentTime) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? (user.role === "admin" ? <Navigate to="/admin-dashboard" /> : <Navigate to="/school-dashboard" />) : <Home />}
        />
        <Route path="/login/:role" element={<Login setUser={setUser} />} />
        <Route
          path="/admin-dashboard"
          element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/school-dashboard"
          element={user?.role === "school" ? <SchoolDashboard /> : <Navigate to="/" />}
        />
        <Route path="/admin-dashboard/schools" element={<SchoolsData />} />
        <Route path="/admin-dashboard/taskmanager" element={<TaskManager />} />
        <Route path="/Tasks" element={<Tasks />} />
        <Route path="/school-dashboard/STM" element={<SchoolTaskManagement />} />
        <Route path="/admin-dashboard/ATA" element={<AdminTaskApproval />} />
        <Route path="/ana" element={<SchoolAnalysisForm />} />
        <Route path="/ai-techer-allocation" element={<InstitutionForm />} />
        <Route path="admin-dashboard/ai-techer-allocation-adminside" element={<TeacherAllocation />} />
        <Route path="admin-dashboard/feedbackana-admin" element={<AdminFeedback />} />
        <Route path="/Feedback" element={<FeedbackForm />} />
      </Routes>
    </Router>
  );
}

export default App;
