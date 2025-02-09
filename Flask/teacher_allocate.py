import joblib
import torch
import torch.nn as nn
import json
import pandas as pd
import numpy as np

def create_df(school_data):
    # Standardized subjects
    subjects = ['Mathematics', 'Nutrition', 'Biology', 'Business Studies', 'Geography', 
                'Science', 'Statistics', 'Physical Education', 'Computer Studies', 
                'Computer Application', 'Work Education', 'Accountancy', 'Economics', 
                'Electronics', 'Psychology', 'Political Science', 'History', 'Bengali', 
                'Social Science', 'Cost and Taxation', 'Music', 'Chemistry', 'Sociology', 
                'Fine Arts', 'Hindi', 'Education', 'Sanskrit', 'Philosophy', 
                'Environmental Studies (EVS)', 'English', 'Art Education', 'Physics', 
                'Computer Science']
    
    # Ideal student-teacher ratio (as per UDISE)
    IDEAL_RATIO = 30
    
    # Convert JSON to DataFrame
    if isinstance(school_data, str):
      school_data = json.loads(school_data)

    df = pd.DataFrame(school_data)
    
    # Ensure Total Students is not zero to avoid division errors
    df["Total Students"] = df["Total Students"].replace(0, np.nan)  # Replace zero with NaN
    
    # Add missing columns for subjects
    for subject in subjects:
        if f"{subject} Students" not in df.columns:
            df[f"{subject} Students"] = 0
        if f"{subject} Teachers" not in df.columns:
            df[f"{subject} Teachers"] = 0
        
        # Compute Subject Demand (Avoid division by zero)
        df[f"{subject} Demand"] = df[f"{subject} Students"] / df["Total Students"]
        df[f"{subject} Demand"] = df[f"{subject} Demand"].fillna(0)  # Replace NaN with 0
        
        # Compute Teachers Needed (Round up)
        df[f"{subject} Teachers Needed"] = np.ceil(df[f"{subject} Students"] / IDEAL_RATIO).astype(int)
    
    return df

class TeacherAllocationNN(nn.Module):
    def __init__(self, input_size, output_size):
        super(TeacherAllocationNN, self).__init__()

        # Define layers
        self.fc1 = nn.Linear(input_size, 256)  # First hidden layer
        self.bn1 = nn.BatchNorm1d(256)         # Batch Normalization
        self.fc2 = nn.Linear(256, 128)         # Second hidden layer
        self.bn2 = nn.BatchNorm1d(128)
        self.fc3 = nn.Linear(128, 64)          # Third hidden layer
        self.bn3 = nn.BatchNorm1d(64)
        self.fc4 = nn.Linear(64, 32)           # Fourth hidden layer
        self.fc5 = nn.Linear(32, output_size)  # Output layer

        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.3)  # 30% dropout

    def forward(self, x):
        x = self.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)
        x = self.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = self.relu(self.bn3(self.fc3(x)))
        x = self.relu(self.fc4(x))
        x = self.fc5(x)  # No activation for regression output
        return x
    
def find_teacher_need(df):
  scaler_X = joblib.load("scaler_X.pkl")
  scaler_Y = joblib.load("scaler_Y.pkl")
  if "School_ID" in df.columns:
    df = df.drop(["School_ID"], axis=1)
  X_test_raw = df.drop([col for col in df.columns if 'Teachers Needed' in col], axis=1)
  X_test_scaled = scaler_X.transform(X_test_raw)
  X_test_tensor = torch.tensor(X_test_scaled, dtype=torch.float32)
  test_input_size = 105
  test_output_size = 33
  model = TeacherAllocationNN(test_input_size, test_output_size)
  model.load_state_dict(torch.load("teacher_allocation_model.pth"))
  model.eval()
  device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
  model.to(device)
  Y_pred_orig = []
  with torch.no_grad():
    for i in X_test_tensor:
      Y_pred_scaled_single = model(i.unsqueeze(0))
      Y_pred = scaler_Y.inverse_transform(Y_pred_scaled_single.numpy())
      subjects = [col for col in df.columns if "Teachers Needed" in col]
      predicted_teachers_needed = {subjects[i]: round(Y_pred[0][i]) for i in range(len(subjects))}
      Y_pred_orig.append(predicted_teachers_needed)

  return Y_pred_orig