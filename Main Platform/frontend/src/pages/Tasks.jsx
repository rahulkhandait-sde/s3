import { useState, useEffect } from "react"
import { FaChevronDown, FaChevronUp, FaTasks, FaStar, FaClipboardCheck } from "react-icons/fa"
import { toast, Toaster } from "react-hot-toast"
import { Backbutton } from "../components/Backbutton"
import { motion, AnimatePresence } from "framer-motion"

const Tasks = () => {
  const [modules, setModules] = useState([])
  const [expandedModules, setExpandedModules] = useState({})

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/school//modules")
      const data = await response.json()
      setModules(data)
      toast.success("Modules loaded successfully!", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
    } catch (error) {
      console.error("Error fetching modules:", error)
      toast.error("Failed to load modules. Please try again.", {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto">
        <Backbutton />
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800 animate-fade-in">
          Standardization Modules and Tasks
        </h1>
        <AnimatePresence>
          {modules.map((module) => (
            <motion.div
              key={module._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6 rounded-xl overflow-hidden shadow-lg bg-white"
            >
              <div
                className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-500 to-purple-600 cursor-pointer transition-all duration-300 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => toggleModule(module._id)}
              >
                <h2 className="text-2xl font-semibold text-white">{module.moduleName}</h2>
                <motion.div animate={{ rotate: expandedModules[module._id] ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {expandedModules[module._id] ? (
                    <FaChevronUp className="text-white text-xl" />
                  ) : (
                    <FaChevronDown className="text-white text-xl" />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {expandedModules[module._id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                  >
                    <p className="text-sm text-gray-600 mb-4">Created: {formatDate(module.createdAt)}</p>
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
                      <FaTasks className="mr-2" /> Tasks
                    </h3>
                    {module.tasks.length > 0 ? (
                      module.tasks.map((task) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4 bg-indigo-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                          <h4 className="font-medium text-lg text-indigo-800 mb-2">{task.taskName}</h4>
                          <p className="text-gray-700 mb-2">{task.taskDescription}</p>
                          <div className="flex items-center text-sm text-indigo-600 mb-1">
                            <FaStar className="mr-1" />
                            <strong>Completion Points:</strong> {task.taskCompletionPoint}
                          </div>
                          <div className="flex items-center text-sm text-purple-600">
                            <FaClipboardCheck className="mr-1" />
                            <strong>Documents to upload for verification: </strong> {task.verificationDocumentsRequired}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Added: {formatDate(task.addingDate)}</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No tasks available for this module.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default Tasks

