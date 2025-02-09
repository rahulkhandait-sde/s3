import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';


const AdminTaskApproval = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks from the API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/task-completion-requests');
                if (!response.ok) {
                    throw new Error('Error fetching tasks');
                }
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                toast.error('Error fetching tasks');
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Handle task approval
    const approveTask = async (taskId) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/update-tasksubmision-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId,
                    adminStatus: 'Approved',
                }),
            });

            if (!response.ok) {
                throw new Error('Error approving task');
            }

            const updatedTask = await response.json();

            toast.success('Task Approved successfully');
            const updatedTasks = tasks.map((task) =>
                task._id === taskId ? { ...task, adminStatus: 'Approved' } : task
            );
            setTasks(updatedTasks);
        } catch (error) {
            toast.error('Error approving task');
        }
    };

    // Handle task rejection
    const rejectTask = async (taskId) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/update-tasksubmision-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId,
                    adminStatus: 'Rejected',
                }),
            });

            if (!response.ok) {
                throw new Error('Error rejecting task');
            }

            const updatedTask = await response.json();

            toast.success('Task Rejected successfully');
            const updatedTasks = tasks.map((task) =>
                task._id === taskId ? { ...task, adminStatus: 'Rejected' } : task
            );
            setTasks(updatedTasks);
        } catch (error) {
            toast.error('Error rejecting task');
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            {/* Toaster component is here */}
            <Toaster />
            <h1 className="text-3xl font-semibold text-center text-blue-600 mb-8">Task Completion Requests</h1>

            <div className="space-y-6">
                {tasks.map((task) => (
                    <motion.div
                        key={task._id}
                        className="bg-white shadow-lg rounded-lg p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{task.taskName}</h2>
                                <p className="text-gray-600">
                                    <strong>Module:</strong> {task.moduleName}
                                </p>
                                <p className="text-gray-600">
                                    <strong>School (UDISE Code):</strong> {task.udise_code}
                                </p>
                            </div>
                            <div
                                className={`px-4 py-2 text-white rounded-full ${task.adminStatus === 'Approved' ? 'bg-green-600' : task.adminStatus === 'Rejected' ? 'bg-red-600' : 'bg-yellow-400'}`}
                            >
                                {task.adminStatus}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-700 mb-4"><strong>Description:</strong> {task.description}</p>
                                <p className="text-gray-700 mb-4"><strong>Expenses:</strong> ₹{task.expenses}</p>
                                <p className="text-gray-700 mb-4"><strong>Challenges Faced:</strong> {task.challengesFaced}</p>
                                <p className="text-gray-700 mb-4"><strong>Problem-Solving Approach:</strong> {task.problemSolvingApproach}</p>
                            </div>

                            <div>
                                <a
                                    href={`http://localhost:5000/${task.supportingDocument}`}
                                    className="text-blue-500 underline mb-4 inline-block"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Supporting Document
                                </a>

                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4 mt-4">
                            {task.adminStatus === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => approveTask(task._id)}
                                        className="px-5 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition duration-300"
                                    >
                                        <FaCheckCircle />
                                        <span>Approve</span>
                                    </button>

                                    <button
                                        onClick={() => rejectTask(task._id)}
                                        className="px-5 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2 hover:bg-red-700 transition duration-300"
                                    >
                                        <FaTimesCircle />
                                        <span>Reject</span>
                                    </button>
                                </>
                            )}
                            {/* No actions for Approved or Rejected tasks */}
                            {task.adminStatus === 'Approved' && (
                                <button
                                    disabled
                                    className="px-5 py-2 bg-gray-400 text-white rounded-lg flex items-center space-x-2 cursor-not-allowed"
                                >
                                    <FaCheckCircle />
                                    <span>Approved</span>
                                </button>
                            )}
                            {task.adminStatus === 'Rejected' && (
                                <button
                                    disabled
                                    className="px-5 py-2 bg-gray-400 text-white rounded-lg flex items-center space-x-2 cursor-not-allowed"
                                >
                                    <FaTimesCircle />
                                    <span>Rejected</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminTaskApproval;
