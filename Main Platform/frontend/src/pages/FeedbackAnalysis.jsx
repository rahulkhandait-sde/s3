import { useState } from "react";

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Feedbacks from Backend API
    const fetchFeedbacks = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/feedbacks-list");
            const data = await response.json();
            setFeedbacks(data); // Expecting an array of feedback strings
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            alert("Failed to fetch feedbacks.");
        }
    };

    // Send Feedbacks to AI API for Analysis
    const analyzeFeedbacks = async () => {
        if (feedbacks.length === 0) {
            alert("No feedbacks available to analyze.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:9000/analyze_feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ feedbacks }),
            });

            const result = await response.json();
            if (result.error) {
                alert(`Error: ${result.error}`);
            } else {
                setInsights([result.summary]); // Convert string summary to an array
            }
        } catch (error) {
            console.error("Error analyzing feedbacks:", error);
            alert("Failed to analyze feedbacks.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Admin Feedback Dashboard</h1>

            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={fetchFeedbacks}>Fetch Feedbacks</button>
                <button
                    style={{ ...styles.button, backgroundColor: "green" }}
                    onClick={analyzeFeedbacks}
                    disabled={loading}
                >
                    {loading ? "Analyzing..." : "Analyze Feedback"}
                </button>
            </div>

            {/* Display Feedbacks */}
            {feedbacks.length > 0 && (
                <div style={styles.card}>
                    <h2>Collected Feedbacks</h2>
                    <ul>
                        {feedbacks.map((feedback, index) => (
                            <li key={index} style={styles.listItem}>{feedback}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Display AI Insights */}
            {/* Display AI Insights */}
            {insights.length > 0 && (
                <div style={{ ...styles.card, backgroundColor: "#f4f4f4" }}>
                    <h2 style={{ color: "green" }}>AI-Generated Insights</h2>
                    <p style={styles.listItem}>{insights[0]}</p>
                </div>
            )}

        </div>
    );
};

// Inline CSS styles
const styles = {
    container: {
        padding: "20px",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        color: "white",
        backgroundColor: "blue",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    card: {
        maxWidth: "500px",
        margin: "0 auto",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
    },
    listItem: {
        textAlign: "left",
        margin: "5px 0",
    },
};

export default AdminFeedback;
