import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"
import AiStandardizationChart from "../components/AiStandardizationChart"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [paymentRequests, setPaymentRequests] = useState([])
  const [expenseRequests, setExpenseRequests] = useState([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [supportingDocument, setSupportingDocument] = useState(null)
  const fileInputRef = useRef(null)
  const [expandedPendingRequests, setExpandedPendingRequests] = useState(false)
  const [expandedApprovedRequests, setExpandedApprovedRequests] = useState(false)
  const [expandedRejectedRequests, setExpandedRejectedRequests] = useState(false)
  const [expandedPaidRequests, setExpandedPaidRequests] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [expandedExpenseRequests, setExpandedExpenseRequests] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/")
    } else {
      fetchPaymentRequests()
      fetchExpenseRequests()
    }
  }, [navigate])

  const fetchPaymentRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/payment-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch payment requests")
      }
      const data = await response.json()
      console.log("Fetched payment requests:", data)
      setPaymentRequests(data)
    } catch (error) {
      console.error("Error fetching payment requests:", error)
      toast.error("Failed to fetch payment requests")
    }
  }

  const fetchExpenseRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/money-deduction-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch expense deduction requests")
      }
      const data = await response.json()
      console.log("Fetched expense deduction requests:", data)
      setExpenseRequests(data)
    } catch (error) {
      console.error("Error fetching expense deduction requests:", error)
      toast.error("Failed to fetch expense deduction requests")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
    navigate("/")
  }

  const handleAddSchool = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/admin/create-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setIsFormOpen(false)
        setFormData({ username: "", password: "" })
      } else {
        toast.error(data.message || "Failed to add school")
      }
    } catch (error) {
      toast.error("An error occurred while adding the school")
    }
  }

  const handleStatusChange = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/admin/payment-request/${selectedPayment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment status")
      }

      toast.success("Payment status updated successfully")
      setIsPaymentModalOpen(false)
      fetchPaymentRequests()
    } catch (error) {
      toast.error("Failed to update payment status")
    }
  }

  const addBalanceToSchool = async (udiseCode, amount, addedBy, document) => {
    const response = await fetch("http://localhost:5000/api/admin/add-balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
      },
      body: JSON.stringify({
        udise_code: udiseCode,
        amount: amount,
        addedBy: addedBy,
        document: document,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to add balance to school wallet")
    }

    return response.json()
  }

  const handleMarkAsPaid = async (e) => {
    e.preventDefault()
    if (!supportingDocument) {
      toast.error("Please upload a supporting document")
      return
    }

    const formData = new FormData()
    formData.append("receipt", supportingDocument)

    try {
      const response = await fetch(`http://localhost:5000/api/admin/payment-request/${selectedPayment._id}/mark-paid`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to mark payment as paid")
      }

      // Add balance to school wallet
      await addBalanceToSchool(selectedPayment.udise_code, selectedPayment.amount, "Admin", supportingDocument.name)

      toast.success("Payment marked as paid and balance added to school wallet")
      setIsPaymentModalOpen(false)
      fetchPaymentRequests()
    } catch (error) {
      toast.error("Failed to mark payment as paid or add balance to school wallet")
    }
  }

  const handleViewDocument = (documentPath) => {
    console.log("Document path:", documentPath)
    if (documentPath) {
      const baseUrl = "http://localhost:5000"
      const fullUrl = new URL(documentPath, baseUrl).toString()
      console.log("Full URL:", fullUrl)
      window.open(fullUrl, "_blank", "noopener,noreferrer")
    } else {
      toast.error("Document not available")
    }
  }

  const handleExpenseStatusChange = async (status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/money-deduction-requests/${selectedExpense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
        body: JSON.stringify({ status, rejection_reason: rejectionReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to update expense status")
      }

      if (status === "Approved") {
        await deductBalanceFromSchool(selectedExpense.udise_code, selectedExpense.amount, "AdminUser")
      }

      toast.success("Expense status updated successfully")
      setIsExpenseModalOpen(false)
      fetchExpenseRequests()
    } catch (error) {
      toast.error("Failed to update expense status")
    }
  }

  const deductBalanceFromSchool = async (udiseCode, amount, addedBy) => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/deduct-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
        },
        body: JSON.stringify({
          udise_code: udiseCode,
          amount: amount,
          addedBy: addedBy,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to deduct balance from school wallet")
      }

      return response.json()
    } catch (error) {
      console.error("Error deducting balance:", error)
      throw error
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

  // Categorize payment requests
  const pendingRequests = paymentRequests.filter((req) => req.status === "Pending")
  const approvedRequests = paymentRequests.filter((req) => req.status === "Approved")
  const rejectedRequests = paymentRequests.filter((req) => req.status === "Rejected")
  const paidRequests = paymentRequests.filter((req) => req.payment_status === "Paid")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 p-4">
      <Toaster position="top-right" />
      <motion.div
        className="w-full max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h2 className="text-4xl font-bold text-indigo-700" variants={itemVariants}>
            Admin Dashboard
          </motion.h2>
          <motion.div variants={itemVariants} className="flex space-x-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              Add School
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </motion.div>
        </div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
          {[
            { title: "Schools", count: 150, color: "bg-blue-500" },
            { title: "Teachers", count: 1200, color: "bg-green-500" },
            { title: "Students", count: 15000, color: "bg-yellow-500" },
            { title: "Standardization Progress", count: "70%", color: "bg-indigo-500" },
            { title: "School Details", color: "bg-purple-500", link: "/admin-dashboard/schools" },
            { title: "Task submissions ", color: "bg-blue-500", link: "/admin-dashboard/ATA" },
            { title: "Task manager", color: "bg-pink-500", link: "admin-dashboard/taskmanager" },
            { title: "AI powered Feedback analysis tool", color: "bg-pink-500", link: "admin-dashboard/feedbackana-admin" },
            { title: "AI powered teacher allocation insights", color: "bg-pink-500", link: "admin-dashboard/ai-techer-allocation-adminside" },
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
<AiStandardizationChart/>
        <motion.div className="mt-8" variants={containerVariants}>
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">Payment Requests</h3>

          {/* Pending Requests */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-orange-600 mb-2">Pending Requests</h4>
            {pendingRequests.length > 0 ? (
              <div className="bg-orange-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p>
                    <strong>Total Pending:</strong> {pendingRequests.length}
                  </p>
                  {pendingRequests.length > 1 && (
                    <button
                      onClick={() => setExpandedPendingRequests(!expandedPendingRequests)}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300"
                    >
                      {expandedPendingRequests ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>
                {(expandedPendingRequests || pendingRequests.length === 1) && (
                  <ul className="space-y-2">
                    {pendingRequests.map((request) => (
                      <li key={request._id} className="border-b border-orange-200 pb-2">
                        <p>
                          <strong>School:</strong> {request.school.name}
                        </p>
                        <p>
                          <strong>Amount:</strong> ${request.amount}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedPayment(request)
                            setIsPaymentModalOpen(true)
                          }}
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Manage
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p>No pending requests.</p>
            )}
          </div>

          {/* Approved Requests */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-green-600 mb-2">Approved Requests</h4>
            {approvedRequests.length > 0 ? (
              <div className="bg-green-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p>
                    <strong>Total Approved:</strong> {approvedRequests.length}
                  </p>
                  {approvedRequests.length > 1 && (
                    <button
                      onClick={() => setExpandedApprovedRequests(!expandedApprovedRequests)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                    >
                      {expandedApprovedRequests ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>
                {(expandedApprovedRequests || approvedRequests.length === 1) && (
                  <ul className="space-y-2">
                    {approvedRequests.map((request) => (
                      <li key={request._id} className="border-b border-green-200 pb-2">
                        <p>
                          <strong>School:</strong> {request.school.name}
                        </p>
                        <p>
                          <strong>Amount:</strong> ${request.amount}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.supporting_document && (
                          <button
                            onClick={() => handleViewDocument(request.supporting_document)}
                            className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
                          >
                            View Document
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPayment(request)
                            setIsPaymentModalOpen(true)
                          }}
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Manage
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p>No approved requests.</p>
            )}
          </div>

          {/* Rejected Requests */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-red-600 mb-2">Rejected Requests</h4>
            {rejectedRequests.length > 0 ? (
              <div className="bg-red-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p>
                    <strong>Total Rejected:</strong> {rejectedRequests.length}
                  </p>
                  {rejectedRequests.length > 1 && (
                    <button
                      onClick={() => setExpandedRejectedRequests(!expandedRejectedRequests)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                    >
                      {expandedRejectedRequests ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>
                {(expandedRejectedRequests || rejectedRequests.length === 1) && (
                  <ul className="space-y-2">
                    {rejectedRequests.map((request) => (
                      <li key={request._id} className="border-b border-red-200 pb-2">
                        <p>
                          <strong>School:</strong> {request.school.name}
                        </p>
                        <p>
                          <strong>Amount:</strong> ${request.amount}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p>No rejected requests.</p>
            )}
          </div>

          {/* Payment Done */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">Payment Done</h4>
            {paidRequests.length > 0 ? (
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p>
                    <strong>Total Paid:</strong> {paidRequests.length}
                  </p>
                  {paidRequests.length > 1 && (
                    <button
                      onClick={() => setExpandedPaidRequests(!expandedPaidRequests)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                    >
                      {expandedPaidRequests ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>
                {(expandedPaidRequests || paidRequests.length === 1) && (
                  <ul className="space-y-2">
                    {paidRequests.map((request) => (
                      <li key={request._id} className="border-b border-blue-200 pb-2">
                        <p>
                          <strong>School:</strong> {request.school.name}
                        </p>
                        <p>
                          <strong>Amount:</strong> ${request.amount}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.supporting_document && (
                          <button
                            onClick={() => handleViewDocument(request.supporting_document)}
                            className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            View Document
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p>No paid requests.</p>
            )}
          </div>
        </motion.div>

        {/* Expense Deduction Requests */}
        <motion.div className="mt-8" variants={containerVariants}>
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">Expense Deduction Requests</h3>
          {expenseRequests.length > 0 ? (
            <div className="bg-yellow-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p>
                  <strong>Total Requests:</strong> {expenseRequests.length}
                </p>
                {expenseRequests.length > 1 && (
                  <button
                    onClick={() => setExpandedExpenseRequests(!expandedExpenseRequests)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300"
                  >
                    {expandedExpenseRequests ? "Collapse" : "Expand"}
                  </button>
                )}
              </div>
              {(expandedExpenseRequests || expenseRequests.length === 1) && (
                <ul className="space-y-2">
                  {expenseRequests.map((request) => (
                    <li key={request._id} className="border-b border-yellow-200 pb-2">
                      <p>
                        <strong>School:</strong> {request.school.name}
                      </p>
                      <p>
                        <strong>Amount:</strong> ${request.amount}
                      </p>
                      <p>
                        <strong>Description:</strong> {request.description}
                      </p>
                      <p>
                        <strong>Status:</strong> {request.status}
                      </p>
                      {request.supporting_document && (
                        <button
                          onClick={() => handleViewDocument(request.supporting_document)}
                          className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
                        >
                          View Document
                        </button>
                      )}
                      {request.status === "Pending" && (
                        <button
                          onClick={() => {
                            setSelectedExpense(request)
                            setIsExpenseModalOpen(true)
                          }}
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Manage
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p>No expense deduction requests.</p>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-full max-w-md"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">Add New School</h3>
              <form onSubmit={handleAddSchool} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                  >
                    Add School
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isPaymentModalOpen && selectedPayment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-full max-w-md"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">Manage Payment Request</h3>
              <p className="mb-4">
                <strong>School:</strong> {selectedPayment.school.name}
                <br />
                <strong>Amount:</strong> ${selectedPayment.amount}
                <br />
                <strong>Current Status:</strong> {selectedPayment.status}
              </p>
              <form onSubmit={handleStatusChange} className="space-y-4 mb-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Change Status
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select new status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                >
                  Update Status
                </button>
              </form>
              <form onSubmit={handleMarkAsPaid} className="space-y-4">
                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                    Upload Supporting Document
                  </label>
                  <input
                    type="file"
                    id="document"
                    onChange={(e) => setSupportingDocument(e.target.files[0])}
                    className="mt-1 block w-full"
                    ref={fileInputRef}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                >
                  Mark as Paid
                </button>
              </form>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
        {isExpenseModalOpen && selectedExpense && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-8 w-full max-w-md"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">Manage Expense Deduction Request</h3>
              <p className="mb-4">
                <strong>School:</strong> {selectedExpense.school.name}
                <br />
                <strong>Amount:</strong> ${selectedExpense.amount}
                <br />
                <strong>Description:</strong> {selectedExpense.description}
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => handleExpenseStatusChange("Approved")}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                >
                  Approve
                </button>
                <div>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleExpenseStatusChange("Rejected")}
                    className="mt-2 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
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

export default AdminDashboard

