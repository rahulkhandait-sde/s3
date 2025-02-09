import { useState } from "react";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    userType: "Student",
    name: "",
    email: "",
    feedback: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending feedback...");
    
    try {
      const response = await fetch("http://localhost:5000/api/school/submitFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage("Feedback submitted successfully!");
        setFormData({ userType: "Student", name: "", email: "", feedback: "" });
      } else {
        setMessage("Failed to submit feedback. Try again.");
      }
    } catch (error) {
      setMessage("Error submitting feedback. Check your connection.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Name:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded mb-2" 
          />
          
          <label className="block mb-2">Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded mb-2" 
          />
          
          <label className="block mb-2">Feedback:</label>
          <textarea 
            name="feedback" 
            value={formData.feedback} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded mb-2"
          ></textarea>
          
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Submit</button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default FeedbackForm;
