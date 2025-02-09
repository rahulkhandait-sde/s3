import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileUpload } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { Backbutton } from "../components/Backbutton"

const SchoolTaskManagement = () => {
  const [modules, setModules] = useState([])
  const [submittedTasks, setSubmittedTasks] = useState([])
  const [selectedModule, setSelectedModule] = useState("")
  const [selectedTask, setSelectedTask] = useState("")
  const [formData, setFormData] = useState({
    description: "",
    expenses: 0,
    challengesFaced: "",
    problemSolvingApproach: "",
    supportingDocument: null,
  })
  const navigate = useNavigate()
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/")
    } else {
      fetchModules(),
        fetchSubmittedTasks()
    }
  }, [navigate])

  const getToken = () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      return null
    }
    try {
      const user = JSON.parse(userStr)
      return user.token
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  }

  useEffect(() => {
    fetchModules()
    fetchSubmittedTasks()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/school/modules")
      const data = await response.json()
      setModules(data)
    } catch (error) {
      toast.error("Failed to fetch modules")
    }
  }

  const fetchSubmittedTasks = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("http://localhost:5000/api/school/get-submited-tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      setSubmittedTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching submitted tasks:", error);
      toast.error(`Failed to fetch submitted tasks: ${error.message}`);
    }
  };


  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value)
    setSelectedTask("")
  }

  const handleTaskChange = (e) => {
    setSelectedTask(e.target.value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, supportingDocument: e.target.files[0] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedModuleObj = modules.find((m) => m._id === selectedModule);
    const selectedTaskObj = selectedModuleObj?.tasks.find((t) => t._id === selectedTask);

    if (!selectedModuleObj || !selectedTaskObj) {
      toast.error("Please select a module and task");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("moduleName", selectedModuleObj.moduleName);
    formDataToSend.append("taskName", selectedTaskObj.taskName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("expenses", formData.expenses.toString());
    formDataToSend.append("challengesFaced", formData.challengesFaced);
    formDataToSend.append("problemSolvingApproach", formData.problemSolvingApproach);
    if (formData.supportingDocument) {
      formDataToSend.append("supportingDocument", formData.supportingDocument);
    }

    try {
      const token = getToken(); // Get the token from localStorage
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("http://localhost:5000/api/school/submit-task", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add token in Authorization header
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchSubmittedTasks();
        setFormData({
          description: "",
          expenses: 0,
          challengesFaced: "",
          problemSolvingApproach: "",
          supportingDocument: null,
        });
        setSelectedModule("");
        setSelectedTask("");
      } else {
        toast.error(data.message || "Failed to submit task");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("An error occurred while submitting the task");
    }
  };

  const isTaskSubmitted = (taskName) => {
    return submittedTasks.some(
      (task) => task.taskName === taskName && (task.adminStatus === "Pending" || task.adminStatus === "Approved"),
    )
  }

  const renderTaskList = (status) => {
    const filteredTasks = submittedTasks.filter((task) => task.adminStatus === status)
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">
          {status === "Pending" && <FaHourglassHalf className="inline mr-2" />}
          {status === "Approved" && <FaCheckCircle className="inline mr-2 text-green-500" />}
          {status === "Rejected" && <FaTimesCircle className="inline mr-2 text-red-500" />}
          {status} Tasks
        </h3>
        {filteredTasks.length > 0 ? (
          <ul className="space-y-2">
            {filteredTasks.map((task) => (
              <li key={task._id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">{task.taskName}</p>
                <p className="text-sm text-gray-600">{task.moduleName}</p>
                <p className="text-sm">{task.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No {status.toLowerCase()} tasks</p>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      <Backbutton />
      <h1 className="text-2xl font-bold mb-6">School Task Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Submit Completed Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Module</label>
            <select value={selectedModule} onChange={handleModuleChange} className="w-full p-2 border rounded" required>
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.moduleName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Task</label>
            <select
              value={selectedTask}
              onChange={handleTaskChange}
              className="w-full p-2 border rounded"
              required
              disabled={!selectedModule}
            >
              <option value="">Select a task</option>
              {modules
                .find((m) => m._id === selectedModule)
                ?.tasks.filter((task) => !isTaskSubmitted(task.taskName))
                .map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.taskName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Expenses</label>
            <input
              type="number"
              name="expenses"
              value={formData.expenses}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Challenges Faced</label>
            <textarea
              name="challengesFaced"
              value={formData.challengesFaced}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Problem Solving Approach</label>
            <textarea
              name="problemSolvingApproach"
              value={formData.problemSolvingApproach}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Supporting Document</label>
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" required />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          <FaFileUpload className="inline mr-2" />
          Submit Task
        </button>
      </form>

      <div className="space-y-8">
        {renderTaskList("Pending")}
        {renderTaskList("Approved")}
        {renderTaskList("Rejected")}
      </div>
    </div>
  )
}

export default SchoolTaskManagement;

