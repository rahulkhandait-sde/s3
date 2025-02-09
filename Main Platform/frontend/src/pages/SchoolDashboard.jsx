import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"

const SchoolDashboard = () => {
  const navigate = useNavigate()
  const [schoolData, setSchoolData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [showWallet, setShowWallet] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [amount, setAmount] = useState("")
  const [document, setDocument] = useState(null)
  const [paymentRequests, setPaymentRequests] = useState([])
  const fileInputRef = useRef(null)
  const [expandedRequest, setExpandedRequest] = useState(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseDocument, setExpenseDocument] = useState(null)
  const expenseFileInputRef = useRef(null)
  const [expenseRequests, setExpenseRequests] = useState([])
  const [totalTasks, setTotalTasks] = useState(0)
  const [approvedTasks, setApprovedTasks] = useState(0)
  const [isTaskDataLoading, setIsTaskDataLoading] = useState(true)
  const [taskDataError, setTaskDataError] = useState(null)
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/")
    } else {
      fetchSchoolData()
      fetchPaymentRequests()
      fetchExpenseRequests()
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

  const fetchSchoolData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found in localStorage")
      }

      console.log("Fetching data from:", "http://localhost:5000/api/school/profile")
      const response = await fetch("http://localhost:5000/api/school/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log("Received data:", data)
      setSchoolData(data)
    } catch (error) {
      console.error("Error fetching school data:", error)
      setError(error.message)
      toast.error(`Failed to load school data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!schoolData || !schoolData.udise_code) return

      setIsTaskDataLoading(true)
      setTaskDataError(null)

      try {
        const totalTasksResponse = await fetch("http://localhost:5000/api/school/total-tasks")
        if (!totalTasksResponse.ok) {
          throw new Error(`Failed to fetch total tasks: ${totalTasksResponse.status} ${totalTasksResponse.statusText}`)
        }
        const totalTasksData = await totalTasksResponse.json()
        console.log("Total tasks data:", totalTasksData)
        if (typeof totalTasksData.totalTasks !== "number") {
          throw new Error(`Invalid total tasks data: ${JSON.stringify(totalTasksData)}`)
        }
        setTotalTasks(totalTasksData.totalTasks)

        // Fetch approved tasks count
        const approvedTasksResponse = await fetch(
          `http://localhost:5000/api/school/approved-tasks/${schoolData.udise_code}`,
        )
        if (!approvedTasksResponse.ok) {
          throw new Error(
            `Failed to fetch approved tasks: ${approvedTasksResponse.status} ${approvedTasksResponse.statusText}`,
          )
        }
        const approvedTasksData = await approvedTasksResponse.json()
        console.log("Approved tasks data:", approvedTasksData)
        if (typeof approvedTasksData.approvedTasksCount !== "number") {
          throw new Error(`Invalid approved tasks data: ${JSON.stringify(approvedTasksData)}`)
        }
        setApprovedTasks(approvedTasksData.approvedTasksCount)
      } catch (error) {
        console.error("Error fetching task data:", error)
        setTaskDataError(error.message)
        toast.error(`Failed to fetch task data: ${error.message}`)
      } finally {
        setIsTaskDataLoading(false)
      }
    }

    fetchTaskData()
  }, [schoolData])

  console.log("Total Tasks:", totalTasks)
  console.log("Approved Tasks:", approvedTasks)

  const fetchPaymentRequests = async () => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found")
      }
      const response = await fetch("http://localhost:5000/api/school/payment-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.paymentRequests) {
        setPaymentRequests(data.paymentRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } else {
        throw new Error("No payment requests data in the response")
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error)
      toast.error("Failed to fetch payment requests")
    }
  }

  const fetchExpenseRequests = async () => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found")
      }
      const response = await fetch("http://localhost:5000/api/school/expense-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.expenseRequests) {
        setExpenseRequests(data.expenseRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } else {
        throw new Error("No expense requests data in the response")
      }
    } catch (error) {
      console.error("Error fetching expense requests:", error)
      toast.error("Failed to fetch expense requests")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    toast.success("Logged out successfully")
    navigate("/", { state: { refresh: true } })
  }

  const handleEdit = (field, value) => {
    setEditingField(field)
    setEditValue(value.toString())
  }

  const handleSave = async () => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found in localStorage")
      }

      const response = await fetch("http://localhost:5000/api/school/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [editingField]: editValue }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      setSchoolData({ ...schoolData, [editingField]: editValue })
      setEditingField(null)
      toast.success("School data updated successfully")
    } catch (error) {
      console.error("Error updating school data:", error)
      toast.error(`Failed to update school data: ${error.message}`)
    }
  }

  const handlePaymentRequest = async (e) => {
    e.preventDefault()
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found")
      }
      const formData = new FormData()
      formData.append("amount", amount)
      formData.append("document", document)

      const response = await fetch("http://localhost:5000/api/school/request-payment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      toast.success("Payment request submitted successfully!")
      setShowPaymentModal(false)
      setAmount("")
      setDocument(null)
      fileInputRef.current.value = ""
      fetchPaymentRequests()
    } catch (error) {
      console.error("Error submitting payment request:", error)
      toast.error("Failed to submit payment request")
    }
  }

  const handleExpenseRequest = async (e) => {
    e.preventDefault()
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No token found")
      }
      const formData = new FormData()
      formData.append("amount", expenseAmount)
      formData.append("description", expenseDescription)
      formData.append("document", expenseDocument)

      const response = await fetch("http://localhost:5000/api/school/request-expense-deduction", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      toast.success("Expense deduction request submitted successfully!")
      setShowExpenseModal(false)
      setExpenseAmount("")
      setExpenseDescription("")
      setExpenseDocument(null)
      expenseFileInputRef.current.value = "" // Clear the file input
      fetchExpenseRequests() // Refresh expense requests
    } catch (error) {
      console.error("Error submitting expense deduction request:", error)
      toast.error("Failed to submit expense deduction request")
    }
  }

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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div>
        <h2>Error: {error}</h2>
        <button onClick={fetchSchoolData}>Retry</button>
      </div>
    )
  }

  if (!schoolData) {
    return <div>No school data available</div>
  }

  const renderEditableField = (title, value, field) => (
    <motion.div key={field} className="bg-white rounded-lg p-6 text-gray-700 shadow-lg" variants={itemVariants}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {editingField === field ? (
        <div className="flex items-center">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-grow border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 ease-in-out"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold">{value}</p>
          <button
            onClick={() => handleEdit(field, value)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            Edit
          </button>
        </div>
      )}
    </motion.div>
  )

  console.log("School Data:", schoolData)
  console.log("Total Tasks:", totalTasks)
  console.log("Approved Tasks:", approvedTasks)
  console.log("Is Task Data Loading:", isTaskDataLoading)
  console.log("Task Data Error:", taskDataError)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 p-8">
      <Toaster position="top-right" />
      <motion.div
        className="w-full max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.div className="flex items-center" variants={itemVariants}>
            {editingField === "name" ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-4xl font-bold text-indigo-700 border-b-2 border-indigo-700 focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-indigo-700">{schoolData.name} Dashboard </h2>
                <button
                  onClick={() => handleEdit("name", schoolData.name)}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <h2 className="p-3"><b>UDISE:{schoolData.udise_code}</b></h2>

              </>
            )}
          </motion.div>
          <motion.div variants={itemVariants}>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </motion.div>
        </div>

        {/* wallet */}
        <div className="inline-block x-1 mb-8">
          <button
            onClick={() => setShowWallet(true)}
            className=" px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Open Wallet
          </button>

          {showWallet && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white w-full h-full p-8 overflow-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-blue-700">Wallet Details</h2>
                    <button
                      onClick={() => setShowWallet(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
                    >
                      Close
                    </button>
                  </div>
                  <div className="bg-blue-100 p-6 rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Total Allocated</h3>
                        <p className="text-3xl font-bold">₹{schoolData.fund_allocation?.total_allocated_amount ?? 0}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Amount Used</h3>
                        <p className="text-3xl font-bold">₹{schoolData.fund_allocation?.current_amount_used ?? 0}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Remaining Balance</h3>
                        <p className="text-3xl font-bold">
                          ${schoolData.fund_allocation?.current_remaining_amount ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-blue-700 mb-4">Payment History</h3>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      {schoolData.fund_allocation?.payment_history?.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {schoolData.fund_allocation.payment_history.map((payment, index) => (
                            <li key={payment._id} className="py-4 flex justify-between items-center">
                              <div>
                                <p className="text-lg font-semibold">${payment.amount}</p>
                                <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                Payment {index + 1}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 text-center">No payment history available</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Payment Request Modal */}
        <div className="ml-2 mb-8 inline-block">
          <button
            onClick={() => setShowPaymentModal(true)}
            className=" px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Request Payment
          </button>

          {showPaymentModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white w-full h-full p-8 overflow-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-blue-700">Request Payment</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handlePaymentRequest} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                      Supporting Document
                    </label>
                    <input
                      type="file"
                      id="document"
                      onChange={(e) => setDocument(e.target.files[0])}
                      className="mt-1 block w-full"
                      required
                      ref={fileInputRef}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                  >
                    Submit Request
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Expense Deduction Request Modal */}
        <div className="ml-2 mb-8 inline-block">
          <button
            onClick={() => setShowExpenseModal(true)}
            className=" px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Request Expense Deduction
          </button>

          {showExpenseModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white w-full h-full p-8 overflow-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-purple-700">Request Expense Deduction</h2>
                  <button
                    onClick={() => setShowExpenseModal(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleExpenseRequest} className="space-y-4">
                  <div>
                    <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="expenseAmount"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="expenseDescription"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expenseDocument" className="block text-sm font-medium text-gray-700">
                      Supporting Document
                    </label>
                    <input
                      type="file"
                      id="expenseDocument"
                      onChange={(e) => setExpenseDocument(e.target.files[0])}
                      className="mt-1 block w-full"
                      required
                      ref={expenseFileInputRef}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out"
                  >
                    Submit Request
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>



        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
          {renderEditableField("Students", schoolData.total_students, "total_students")}
          {renderEditableField("Teachers", schoolData.total_teachers, "total_teachers")}
          {renderEditableField("Staff", schoolData.total_staff, "total_staff")}
          {renderEditableField("Grade Configuration", schoolData.grade_configuration, "grade_configuration")}

          {isTaskDataLoading ? (
            <motion.div className="bg-white rounded-lg p-6 text-gray-700 shadow-lg" variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-2">Standardization Progress</h3>
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </motion.div>
          ) : taskDataError ? (
            <motion.div className="bg-white rounded-lg p-6 text-gray-700 shadow-lg" variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-2">Standardization Progress</h3>
              <p className="text-red-500">Error: {taskDataError}</p>
            </motion.div>
          ) : (
            <motion.div className="bg-white rounded-lg p-6 text-gray-700 shadow-lg" variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-2">Task Completion Progress</h3>
              <p className="text-2xl">{`${totalTasks > 0 ? ((approvedTasks / totalTasks) * 100).toFixed(2) : 0}%`}</p>
            </motion.div>
          )}

          {renderEditableField("District", schoolData.district, "district")}



        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
          {[
            { title: "Standardization Task list", color: "bg-purple-500", link: "/Tasks" },
            { title: "Standardization Task Submission", color: "bg-pink-500", link: "/school-dashboard/STM" },
            { title: "AI powered School structure anyalisis tool", color: "bg-gray-500", link: "/ana" },
            { title: "AI powered Teacher Demand anyalisis tool", color: "bg-gray-500", link: "/ai-techer-allocation" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className={`${item.color} rounded-lg p-6 text-white shadow-lg cursor-pointer`}
              variants={itemVariants}
              onClick={() => item.link && window.location.assign(item.link)}
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              {item.count && <p className="text-3xl font-bold">{item.count}</p>}
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="bg-white rounded-lg shadow-md p-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4">School Information</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-gray-700">
              <span className="font-semibold mr-2">Location:</span>
              {editingField === "location" ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="border rounded px-2 py-1 mr-2"
                  />
                  <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>{schoolData.location}</span>
                  <button
                    onClick={() => handleEdit("location", schoolData.location)}
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </div>
              )}
            </li>
            <li className="flex items-center text-gray-700">
              <span className="font-semibold mr-2">Last Updated:</span>{" "}
              {new Date(schoolData.lastUpdated).toLocaleDateString()}
            </li>
            <li className="flex items-center text-gray-700">
              <span className="font-semibold mr-2">Username:</span> {schoolData.username}
            </li>
          </ul>
        </motion.div>

        {/* Payment Requests Section */}
        <motion.div className="mt-8 bg-white rounded-lg shadow-md p-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Payment Requests</h3>
          {paymentRequests.length > 0 ? (
            <ul className="space-y-4">
              {paymentRequests.map((request) => (
                <li key={request._id} className="border-b pb-4">
                  <p>
                    <strong>Amount:</strong> ${request.amount}
                  </p>
                  <p>
                    <strong>Status:</strong> {request.status}
                  </p>
                  <p>
                    <strong>Payment Status:</strong> {request.payment_status}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Document:</strong>{" "}
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {expandedRequest === request._id ? "Hide" : "Show"} Document
                    </button>
                  </p>
                  {expandedRequest === request._id && (
                    <div className="mt-2 bg-gray-100 p-2 rounded">
                      {request.money_receipt ? (
                        <>
                          <p>{request.money_receipt.split("\\").pop()}</p>
                          <a
                            href={`http://localhost:5000/${request.money_receipt}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Download
                          </a>
                        </>
                      ) : (
                        <p className="text-red-500 font-semibold">Not Available</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No payment requests found.</p>
          )}
        </motion.div>

        {/* Expense Deduction Requests Section */}
        <motion.div className="mt-8 bg-white rounded-lg shadow-md p-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Expense Deduction Requests</h3>
          {expenseRequests.length > 0 ? (
            <ul className="space-y-4">
              {expenseRequests.map((request) => (
                <li key={request._id} className="border-b pb-4">
                  <p>
                    <strong>Amount:</strong> ${request.amount}
                  </p>
                  <p>
                    <strong>Description:</strong> {request.description}
                  </p>
                  <p>
                    <strong>Status:</strong> {request.status}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Document:</strong>{" "}
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {expandedRequest === request._id ? "Hide" : "Show"} Document
                    </button>
                  </p>
                  {expandedRequest === request._id && (
                    <div className="mt-2 bg-gray-100 p-2 rounded">
                      {request.supporting_document ? (
                        <>
                          <p>{request.supporting_document.split("\\").pop()}</p>
                          <a
                            href={`http://localhost:5000/${request.supporting_document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Download
                          </a>
                        </>
                      ) : (
                        <p className="text-red-500 font-semibold">Not Available</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No expense deduction requests found.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SchoolDashboard

