import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"
import { Backbutton } from "../components/Backbutton"

const SchoolsData = () => {
  const navigate = useNavigate()
  const [schools, setSchools] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/")
    } else {
      fetchSchools()
    }
  }, [navigate])

  const fetchSchools = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/schools", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}").token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch schools")
      }
      const data = await response.json()
      setSchools(data)
    } catch (error) {
      toast.error("Failed to fetch schools")
    }
  }

  const filteredSchools = schools.filter((school) => school.udise_code.toLowerCase().includes(searchTerm.toLowerCase()))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 p-4">
      <Backbutton/>  
      <Toaster position="top-right" />
      <motion.div
        className="w-full max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="text-4xl font-bold text-indigo-700 mb-8" variants={itemVariants}>
          Schools Data
        </motion.h2>

        <motion.div className="mb-6" variants={itemVariants}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by UDISE code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
          {filteredSchools.map((school) => (
            <motion.div key={school._id} variants={itemVariants}>
              <div
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => setSelectedSchool(school)}
              >
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">{school.name}</h3>
                <p className="text-gray-600">UDISE: {school.udise_code}</p>
                <p className="text-gray-600">District: {school.district}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedSchool && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-full max-w-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">{selectedSchool.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <strong>UDISE Code:</strong> {selectedSchool.udise_code}
                </p>
                <p>
                  <strong>District:</strong> {selectedSchool.district}
                </p>
                <p>
                  <strong>Location:</strong> {selectedSchool.location}
                </p>
                <p>
                  <strong>Total Students:</strong> {selectedSchool.total_students}
                </p>
                <p>
                  <strong>Total Teachers:</strong> {selectedSchool.total_teachers}
                </p>
                <p>
                  <strong>Total Staff:</strong> {selectedSchool.total_staff}
                </p>
                <p>
                  <strong>Grade Configuration:</strong> {selectedSchool.grade_configuration}
                </p>
                <p>
                  <strong>Standardization %:</strong> {selectedSchool.standardization_percentage}%
                </p>
                {selectedSchool.fund_allocation && (
                  <>
                    <p>
                      <strong>Total Allocated Amount:</strong> ₹{selectedSchool.fund_allocation.total_allocated_amount}
                    </p>
                    <p>
                      <strong>Current Remaining Amount:</strong> ₹
                      {selectedSchool.fund_allocation.current_remaining_amount}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SchoolsData

