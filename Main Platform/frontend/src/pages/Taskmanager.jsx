import { useState, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const TaskManager = () => {
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskCompletionPoint: "",
    verificationDocumentsRequired: "",
  });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchTasks(selectedModule);
    }
  }, [selectedModule]);

  const fetchModules = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/modules");
      const data = await res.json();
      setModules(data);
    } catch (error) {
      toast.error("Error fetching modules");
    }
  };

  const fetchTasks = async (moduleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/modules`);
      const data = await res.json();
      const moduleData = data.find((mod) => mod._id === moduleId);
      setTasks(moduleData ? moduleData.tasks : []);
    } catch (err) {
      toast.error("Error fetching tasks");
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/add-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleName, addingDate: new Date().toISOString() }),
      });
      if (res.ok) {
        toast.success("Module added successfully");
        setModuleName("");
        fetchModules();
      }
    } catch (error) {
      toast.error("Error adding module");
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModule) {
      toast.error("Please select a module first");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/update-module/${selectedModule}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: [newTask] }),
      });
      if (res.ok) {
        toast.success("Task added successfully");
        setTasks([...tasks, newTask]);
        setNewTask({
          taskName: "",
          taskDescription: "",
          taskCompletionPoint: "",
          verificationDocumentsRequired: "",
        });
      }
    } catch (error) {
      toast.error("Error adding task");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <button onClick={() => window.history.back()} className="mr-4 text-gray-600 hover:text-gray-800">
              <FaArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Module & Task Manager</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <form onSubmit={handleModuleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Module</h3>
                <div className="mb-4">
                  <label htmlFor="moduleName" className="block text-sm font-medium text-gray-700 mb-2">Module Name:</label>
                  <input
                    id="moduleName"
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center">
                  <FaPlus className="mr-2" />
                  Add Module
                </button>
              </form>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Module:</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a Module --</option>
                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>{module.moduleName}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleTaskSubmit} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Task</h3>
              {Object.entries(newTask).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:
                  </label>
                  <input
                    id={key}
                    name={key}
                    type={key === "taskCompletionPoint" ? "number" : "text"}
                    value={value}
                    onChange={(e) => setNewTask({ ...newTask, [key]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center">
                <FaPlus className="mr-2" />
                Add Task
              </button>
            </form>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Existing Tasks</h3>
            {tasks.length > 0 ? (
              <ul className="bg-white rounded-lg shadow overflow-hidden">
                {tasks.map((task, index) => (
                  <li key={index} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                      <h4 className="text-lg font-semibold text-gray-800">{task.taskName}</h4>
                      <p className="text-gray-600 mt-1">{task.taskDescription}</p>
                      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                        <span>Completion Points: {task.taskCompletionPoint}</span>
                        <span>Verification Required: {task.verificationDocumentsRequired}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg shadow">No tasks available for this module.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
