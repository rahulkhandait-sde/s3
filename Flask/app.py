from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_new_school
from teacher_allocate import find_teacher_need, create_df
import pandas as pd
from feedback_analysis_test import analyze_feedback, predict_sentiment, predict_policy_match
app = Flask(__name__)

# Allow requests from your React frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

columns = [
    'School Lat', 'School Long', 'Rural/Urban', 'Student-Teacher Ratio',
    'Total Students', 'Total Teachers',
    'Mathematics Students', 'Mathematics Teachers', 'Nutrition Students', 'Nutrition Teachers',
    'Biology Students', 'Biology Teachers', 'Business Studies Students', 'Business Studies Teachers',
    'Geography Students', 'Geography Teachers', 'Science Students', 'Science Teachers',
    'Statistics Students', 'Statistics Teachers', 'Physical Education Students', 'Physical Education Teachers',
    'Computer Studies Students', 'Computer Studies Teachers', 'Computer Application Students', 'Computer Application Teachers',
    'Work Education Students', 'Work Education Teachers', 'Accountancy Students', 'Accountancy Teachers',
    'Economics Students', 'Economics Teachers', 'Electronics Students', 'Electronics Teachers',
    'Psychology Students', 'Psychology Teachers', 'Political Science Students', 'Political Science Teachers',
    'History Students', 'History Teachers', 'Bengali Students', 'Bengali Teachers',
    'Social Science Students', 'Social Science Teachers', 'Cost and Taxation Students', 'Cost and Taxation Teachers',
    'Music Students', 'Music Teachers', 'Chemistry Students', 'Chemistry Teachers',
    'Sociology Students', 'Sociology Teachers', 'Fine Arts Students', 'Fine Arts Teachers',
    'Hindi Students', 'Hindi Teachers', 'Education Students', 'Education Teachers',
    'Sanskrit Students', 'Sanskrit Teachers', 'Philosophy Students', 'Philosophy Teachers',
    'Environmental Studies (EVS) Students', 'Environmental Studies (EVS) Teachers', 'English Students', 'English Teachers',
    'Art Education Students', 'Art Education Teachers', 'Physics Students', 'Physics Teachers',
    'Computer Science Students', 'Computer Science Teachers',
    'Mathematics Demand', 'Mathematics Teachers Needed', 'Nutrition Demand', 'Nutrition Teachers Needed',
    'Biology Demand', 'Biology Teachers Needed', 'Business Studies Demand', 'Business Studies Teachers Needed',
    'Geography Demand', 'Geography Teachers Needed', 'Science Demand', 'Science Teachers Needed',
    'Statistics Demand', 'Statistics Teachers Needed', 'Physical Education Demand', 'Physical Education Teachers Needed',
    'Computer Studies Demand', 'Computer Studies Teachers Needed', 'Computer Application Demand', 'Computer Application Teachers Needed',
    'Work Education Demand', 'Work Education Teachers Needed', 'Accountancy Demand', 'Accountancy Teachers Needed',
    'Economics Demand', 'Economics Teachers Needed', 'Electronics Demand', 'Electronics Teachers Needed',
    'Psychology Demand', 'Psychology Teachers Needed', 'Political Science Demand', 'Political Science Teachers Needed',
    'History Demand', 'History Teachers Needed', 'Bengali Demand', 'Bengali Teachers Needed',
    'Social Science Demand', 'Social Science Teachers Needed', 'Cost and Taxation Demand', 'Cost and Taxation Teachers Needed',
    'Music Demand', 'Music Teachers Needed', 'Chemistry Demand', 'Chemistry Teachers Needed',
    'Sociology Demand', 'Sociology Teachers Needed', 'Fine Arts Demand', 'Fine Arts Teachers Needed',
    'Hindi Demand', 'Hindi Teachers Needed', 'Education Demand', 'Education Teachers Needed',
    'Sanskrit Demand', 'Sanskrit Teachers Needed', 'Philosophy Demand', 'Philosophy Teachers Needed',
    'Environmental Studies (EVS) Demand', 'Environmental Studies (EVS) Teachers Needed', 'English Demand', 'English Teachers Needed',
    'Art Education Demand', 'Art Education Teachers Needed', 'Physics Demand', 'Physics Teachers Needed',
    'Computer Science Demand', 'Computer Science Teachers Needed'
]

@app.route('/analyze', methods=['POST'])
def analyze_school():
    form_data = request.json  # Get JSON data from React frontend

    # Replace None or empty values with 0
    for key in form_data:
        if form_data[key] is None or form_data[key] == '':
            form_data[key] = 0

    recommendations, standardization_percentage = analyze_new_school(new_school_data=form_data)

    return jsonify({
        'recommendations': recommendations,
        'standardization_percentage': standardization_percentage
    }), 200
@app.route('/allocate', methods=['POST'])
def allocate_teacher():
    try:
        form_data = request.json  # Receive input data
        print("Received form data:", form_data)  # Debugging

        # Convert form data to DataFrame
        synthetic_data = pd.DataFrame([form_data])

        # Load exact feature names used during training
        trained_feature_names = [
            "School Lat", "School Long", "Rural/Urban", "Student-Teacher Ratio",
            "Total Students", "Total Teachers",
            "Mathematics Students", "Mathematics Teachers", "Nutrition Students", "Nutrition Teachers",
            "Biology Students", "Biology Teachers", "Business Studies Students", "Business Studies Teachers",
            "Geography Students", "Geography Teachers", "Science Students", "Science Teachers",
            "Statistics Students", "Statistics Teachers", "Physical Education Students", "Physical Education Teachers",
            "Computer Studies Students", "Computer Studies Teachers", "Computer Application Students", "Computer Application Teachers",
            "Work Education Students", "Work Education Teachers", "Accountancy Students", "Accountancy Teachers",
            "Economics Students", "Economics Teachers", "Electronics Students", "Electronics Teachers",
            "Psychology Students", "Psychology Teachers", "Political Science Students", "Political Science Teachers",
            "History Students", "History Teachers", "Bengali Students", "Bengali Teachers",
            "Social Science Students", "Social Science Teachers", "Cost and Taxation Students", "Cost and Taxation Teachers",
            "Music Students", "Music Teachers", "Chemistry Students", "Chemistry Teachers",
            "Sociology Students", "Sociology Teachers", "Fine Arts Students", "Fine Arts Teachers",
            "Hindi Students", "Hindi Teachers", "Education Students", "Education Teachers",
            "Sanskrit Students", "Sanskrit Teachers", "Philosophy Students", "Philosophy Teachers",
            "Environmental Studies (EVS) Students", "Environmental Studies (EVS) Teachers", "English Students", "English Teachers",
            "Art Education Students", "Art Education Teachers", "Physics Students", "Physics Teachers",
            "Computer Science Students", "Computer Science Teachers",
            "Mathematics Demand", "Mathematics Teachers Needed", "Nutrition Demand", "Nutrition Teachers Needed",
            "Biology Demand", "Biology Teachers Needed", "Business Studies Demand", "Business Studies Teachers Needed",
            "Geography Demand", "Geography Teachers Needed", "Science Demand", "Science Teachers Needed",
            "Statistics Demand", "Statistics Teachers Needed", "Physical Education Demand", "Physical Education Teachers Needed",
            "Computer Studies Demand", "Computer Studies Teachers Needed", "Computer Application Demand", "Computer Application Teachers Needed",
            "Work Education Demand", "Work Education Teachers Needed", "Accountancy Demand", "Accountancy Teachers Needed",
            "Economics Demand", "Economics Teachers Needed", "Electronics Demand", "Electronics Teachers Needed",
            "Psychology Demand", "Psychology Teachers Needed", "Political Science Demand", "Political Science Teachers Needed",
            "History Demand", "History Teachers Needed", "Bengali Demand", "Bengali Teachers Needed",
            "Social Science Demand", "Social Science Teachers Needed", "Cost and Taxation Demand", "Cost and Taxation Teachers Needed",
            "Music Demand", "Music Teachers Needed", "Chemistry Demand", "Chemistry Teachers Needed",
            "Sociology Demand", "Sociology Teachers Needed", "Fine Arts Demand", "Fine Arts Teachers Needed",
            "Hindi Demand", "Hindi Teachers Needed", "Education Demand", "Education Teachers Needed",
            "Sanskrit Demand", "Sanskrit Teachers Needed", "Philosophy Demand", "Philosophy Teachers Needed",
            "Environmental Studies (EVS) Demand", "Environmental Studies (EVS) Teachers Needed", "English Demand", "English Teachers Needed",
            "Art Education Demand", "Art Education Teachers Needed", "Physics Demand", "Physics Teachers Needed",
            "Computer Science Demand", "Computer Science Teachers Needed"
        ]

        # Add missing columns with default value 0
        for col in trained_feature_names:
            if col not in synthetic_data.columns:
                synthetic_data[col] = 0  

        # Remove any extra columns not in the trained model
        synthetic_data = synthetic_data[trained_feature_names]

        # 🔹 **Convert empty strings to 0** before prediction
        synthetic_data.replace('', 0, inplace=True)

        # 🔹 **Convert all columns to numeric (if possible)**
        synthetic_data = synthetic_data.apply(pd.to_numeric, errors='coerce').fillna(0)

        # Predict teacher needs
        Y_pred_orig = find_teacher_need(synthetic_data)

        return jsonify(Y_pred_orig), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500



# Fix CORS Preflight Requests
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route("/analyze_feedback", methods=["POST"])
def analyze():
    try:
        data = request.json
        feedback_list = data.get("feedbacks", [])
        if not feedback_list:
            return jsonify({"error": "No feedback provided"}), 400
        
        summary = analyze_feedback(feedback_list)
        return jsonify({"summary": summary})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, port=9000)

