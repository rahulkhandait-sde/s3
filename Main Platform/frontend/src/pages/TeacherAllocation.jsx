import { useEffect, useState } from "react";
import { Backbutton } from "../components/Backbutton";

const TeacherAllocation = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/subject-demand");
                const data = await response.json();
                if (data.success) {
                    setSchools(data.schools);
                } else {
                    console.error("Error fetching schools:", data.message);
                }
            } catch (error) {
                console.error("Error fetching schools:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    if (loading) {
        return <div className="text-center text-xl font-bold mt-5">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-5">
            <Backbutton />
            <h2 className="text-2xl font-bold mb-5 text-center">📌 AI-Based Teacher Allocation</h2>
            <div className="space-y-6">
                {schools.map((school, index) => (
                    <div key={school._id} className="bg-white shadow-md rounded-lg p-5 border-l-8 border-blue-500">
                        <h3 className="text-xl font-semibold">
                            School UDISE ID: <span className="text-blue-600">{school.udiseId}</span>
                        </h3>
                        <p className="text-gray-600">
                            <strong>Location:</strong>{" "}
                            {school.ruralUrban === "1" ? "🏡 Rural" : "🏙️ Urban"}
                        </p>
                        <p className="text-gray-800 font-medium">
                            <strong>Total Teachers Needed:</strong> {school.totalTeachersNeeded}
                        </p>

                        {/* Teacher Demand Table */}
                        <div className="mt-3">
                            <h4 className="text-lg font-semibold text-gray-700">Subject-Wise Demand</h4>
                            <table className="w-full border-collapse border border-gray-300 mt-2">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-3 py-2">Subject</th>
                                        <th className="border border-gray-300 px-3 py-2">Teachers Needed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(school.demandData)
                                        .filter(([_, count]) => count > 0)
                                        .map(([subject, count]) => (
                                            <tr key={subject} className="border border-gray-300">
                                                <td className="px-3 py-2">{subject}</td>
                                                <td className="px-3 py-2 font-semibold text-blue-600">{count}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherAllocation;
