import { useState } from "react";
import { Backbutton } from "../components/Backbutton";

const SchoolForm = () => {
  const [formData, setFormData] = useState({
    "School_ID": 0,
    "School Lat": "",
    "School Long": "",
    "Rural/Urban": "",
    "Student-Teacher Ratio": "",
    "Total Students": "",
    "Total Teachers": "",
    "Computer Application Students": "",
    "Computer Application Teachers": "",
    "Work Education Students": "",
    "Work Education Teachers": "",
    "Accountancy Students": "",
    "Accountancy Teachers": "",
    "Economics Students": "",
    "Economics Teachers": "",
    "Electronics Students": "",
    "Electronics Teachers": "",
    "Psychology Students": "",
    "Psychology Teachers": "",
    "Political Science Students": "",
    "Political Science Teachers": "",
    "History Students": "",
    "History Teachers": "",
    "Bengali Students": "",
    "Bengali Teachers": "",
    "Social Science Students": "",
    "Social Science Teachers": "",
  });

  const [teacherDemand, setTeacherDemand] = useState(null);
  const [udiseID, setUdiseID] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === "" ? "" : parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(parsedValue) ? "" : parsedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending Data:", formData);
    try {
      const response = await fetch("http://127.0.0.1:9000/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("AI Response:", data);

      // Assuming AI response contains teacher demand data
      if (Array.isArray(data) && data.length > 0) {
        setTeacherDemand(data[0]); // Store teacher demand data
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStoreData = async () => {
    if (!udiseID || !formData["Rural/Urban"]) {
      alert("Please enter a valid UDISE ID and Rural/Urban before storing the data.");
      return;
    }
  
    const finalData = {
      udiseId: udiseID,
      demandData: teacherDemand, // Store teacher demand
      ruralUrban: formData["Rural/Urban"], // Add Rural/Urban field
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/school/subject-demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
  
      const result = await response.json();
      console.log("Stored Data Response:", result);
      alert("Teacher demand data stored successfully!");
    } catch (error) {
      console.error("Error storing data:", error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Backbutton/>
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        School Data Form
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Essential Fields */}
        {[
          "School_ID",
          "School Lat",
          "School Long",
          "Rural/Urban",
          "Student-Teacher Ratio",
          "Total Students",
          "Total Teachers",
        ].map((field, index) => (
          <div key={index} className="flex flex-col">
            <label className="text-gray-700 font-medium">{field}:</label>
            <input
              type="number"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        ))}

        {/* Subject-wise Fields (Optional) */}
        <details className="sm:col-span-2">
          <summary className="cursor-pointer text-blue-600 font-medium">Add Subject-Wise Details (Optional)</summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {Object.keys(formData)
              .filter(
                (field) =>
                  !["School_ID", "School Lat", "School Long", "Rural/Urban", "Student-Teacher Ratio", "Total Students", "Total Teachers"].includes(field)
              )
              .map((field, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-600">{field}:</label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
          </div>
        </details>

        <div className="sm:col-span-2 flex justify-center">
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Display AI-generated Teacher Demand Data */}
      {teacherDemand && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center text-blue-700">Teacher Demand Data</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {Object.entries(teacherDemand).map(([key, value], index) => (
              <div key={index} className="flex justify-between p-2 border-b">
                <span className="text-gray-700">{key}:</span>
                <span className="font-semibold text-blue-600">{value}</span>
              </div>
            ))}
          </div>

          {/* UDISE ID Input and Store Button */}
          <div className="mt-4">
            <label className="text-gray-700 font-medium">Enter UDISE ID:</label>
            <input
              type="text"
              value={udiseID}
              onChange={(e) => setUdiseID(e.target.value)}
              className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              required
            />
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleStoreData}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Store Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolForm;
