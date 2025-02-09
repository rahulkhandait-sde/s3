import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Modal Component
const Modal = ({ feature, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
      >
        &times; 
      </button>
      <div className="text-4xl mb-4">{feature.icon}</div>
      <h3 className="text-2xl font-semibold text-indigo-600 mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const currentTime = Math.floor(Date.now() / 1000);
      if (user.exp && user.exp > currentTime) {
        navigate(user.role === "admin" ? "/admin-dashboard" : "/school-dashboard");
      }
    }
  }, [navigate]);

  const features = [
    {
      title: "AI-Driven Analysis",
      description: "Utilize AI to analyze and classify school structures",
      icon: "🧠",
    },
    {
      title: "Standardization Support",
      description: "Access guidelines and resources for structural transitions",
      icon: "📚",
    },
    {
      title: "Resource Allocation",
      description: "Optimize resource distribution based on school needs",
      icon: "📊",
    },
    {
      title: "Progress Monitoring",
      description: "Track transition progress with real-time dashboards",
      icon: "📈",
    },
    {
      title: "Stakeholder Engagement",
      description: "Collaborate through interactive online portals",
      icon: "🤝",
    },
    {
      title: "Data-Driven Decisions",
      description: "Make informed choices with comprehensive analytics",
      icon: "💡",
    },
  ];

  const openModal = (index) => {
    setActiveFeature(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveFeature(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 flex flex-col justify-center items-center p-4 overflow-hidden pt-20">
      <motion.div className="max-w-7xl w-full" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-700 mb-4">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">S3</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            School Structure Standardization Software: Empowering Education Through AI-Driven Analysis and Standardization
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.button
              onClick={() => navigate("/login/admin")}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Admin Login
            </motion.button>
            <motion.button
              onClick={() => navigate("/login/school")}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              School Login
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
              variants={itemVariants}
              onClick={() => openModal(index)} // Open the modal when clicked
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {modalOpen && <Modal feature={features[activeFeature]} onClose={closeModal} />}
    </div>
  );
};

export default Home;
