import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaCrown } from "react-icons/fa";

// Define custom colors for the pie chart sections
const COLORS = ["#FF0000", "#FFD700", "#32CD32", "#8A2BE2"]; 

const AiStandardizationPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    fetch("http://localhost:5000/api/school/school-analysis")
      .then((response) => response.json())
      .then((records) => {
        if (!records || records.length === 0) {
          console.warn("No data received from API.");
          setLoading(false);
          return;
        }

        // Categorize the records based on the standardization_percentage
        const categorizedData = [
          { name: "1-40% (Low)", value: records.filter(r => r.standardization_percentage <= 40 && typeof r.standardization_percentage === 'number').length },
          { name: "40-60% (Medium)", value: records.filter(r => r.standardization_percentage > 40 && r.standardization_percentage <= 60 && typeof r.standardization_percentage === 'number').length },
          { name: "60-80% (High)", value: records.filter(r => r.standardization_percentage > 60 && r.standardization_percentage <= 80 && typeof r.standardization_percentage === 'number').length },
          { name: "80-100% (Perfect)", value: records.filter(r => r.standardization_percentage > 80 && typeof r.standardization_percentage === 'number').length },
        ];
        setData(categorizedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: "100%", textAlign: "center", position: "relative" }}>
      <h2>AI Standardization Distribution</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : data.every((d) => d.value === 0) ? (
        <p>No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={130}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* King Icon for Perfect Schools */}
      {data[3]?.value > 0 && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "2rem",
            color: "#FFD700",
          }}
        >
          <FaCrown />
        </div>
      )}
    </div>
  );
};

export default AiStandardizationPieChart;
