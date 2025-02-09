import pandas as pd
import numpy as np
import joblib
import sklearn
from sklearn.metrics.pairwise import euclidean_distances
def preprocess_new_school_ssa(new_school_data):
    feature_columns = ['lowclass', 'highclass', 'approachable_road', 'pre_primary',
       'anganwadi_premises', 'anganwadi_boys', 'anganwadi_girls',
       'instr_days_pr', 'instr_days_up', 'avg_school_hrs_student_pr',
       'avg_school_hrs_student_up', 'avg_school_hrs_teacher_pr',
       'avg_school_hrs_teacher_up', 'special_training', 'acad_inspections',
       'crc_coordinator', 'block_level_officers', 'district_officers',
       'smc_exists', 'free_text_books_pr', 'free_uniform_pr',
       'free_text_books_up', 'free_uniform_up', 'no_building_blocks',
       'pucca_building_blocks', 'boundary_wall', 'total_class_rooms',
       'other_rooms', 'classrooms_in_good_condition',
       'classrooms_needs_minor_repair', 'classrooms_needs_major_repair',
       'separate_room_for_hm', 'total_boys_toilet', 'total_boys_func_toilet',
       'total_girls_toilet', 'total_girls_func_toilet',
       'func_boys_cwsn_friendly', 'func_girls_cwsn_friendly', 'urinal_boys',
       'urinla_girls', 'handwash_near_toilet', 'rain_water_harvesting',
       'handwash_facility_for_meal', 'electricity_availability',
       'library_availability', 'playground_available', 'medical_checkups',
       'availability_ramps', 'availability_of_handrails',
       'furniture_availability', 'school_type_1', 'school_type_2',
       'school_type_3', 'smdc_1', 'smdc_2', 'smdc_3', 'solar_1', 'solar_2',
       'solar_3', 'transport_0', 'transport_1', 'transport_22', 'cce_pr_1',
       'cce_pr_2', 'cce_pr_9', 'cce_up_1', 'cce_up_2', 'cce_up_9',
       'anganwadi_worker_0', 'anganwadi_worker_1', 'anganwadi_worker_2',
       'building_status_1', 'building_status_2', 'building_status_3',
       'building_status_4', 'building_status_7', 'building_status_10']
    
    scaler = joblib.load('scaler.pkl')
    # loading the new_user_school_data
    new_school_df = pd.DataFrame([new_school_data])
    
    # school_type feature encoding
    new_school_df = pd.get_dummies(new_school_df, columns=['school_type'], prefix='school_type')
    new_school_df = pd.get_dummies(new_school_df, columns=['smdc'], prefix='smdc')
    new_school_df = pd.get_dummies(new_school_df, columns=['solar'], prefix='solar')
    new_school_df = pd.get_dummies(new_school_df, columns=['transport_pr'], prefix='transport')
    new_school_df = pd.get_dummies(new_school_df, columns=['cce_pr', 'cce_up'], prefix=['cce_pr', 'cce_up'])
    new_school_df = pd.get_dummies(new_school_df, columns=['anganwadi_worker'], prefix=['anganwadi_worker'])
    new_school_df = pd.get_dummies(new_school_df, columns=['building_status'], prefix=['building_status'])

    training_columns = {"school_type": ["school_type_1", "school_type_2", "school_type_3"],
        "smdc": ['smdc_1', 'smdc_2', 'smdc_3'],
        "solar": ['solar_1', 'solar_2', 'solar_3'],
        "transport_pr": ['transport_0', 'transport_1', 'transport_22'],
        "cce": ['cce_pr_1', 'cce_pr_2', 'cce_pr_9', 'cce_up_1', 'cce_up_2', 'cce_up_9'],
        "anganwadi_worker": ['anganwadi_worker_0', 'anganwadi_worker_1', 'anganwadi_worker_2'],
        "building_status": ['building_status_1', 'building_status_2', 'building_status_3',
                            'building_status_4', 'building_status_7', 'building_status_10']
    }

    # checking and appending the columns that are not in the new dataframe but exists in the orig dataframe
    for col_list in training_columns.values():
        for col in col_list:
            if col not in new_school_df:
                new_school_df[col] = 0
            
    new_school_df = new_school_df.reindex(columns=feature_columns, fill_value=0)
    # converting to integers
    new_school_df = new_school_df.astype(int)

    new_school_scaled = scaler.transform(new_school_df)
    return pd.DataFrame(new_school_scaled, columns=feature_columns)

def calculate_standardization_percentage(new_school_scaled):

    model = joblib.load('best_rf_model.joblib')
    y_pred = model.predict(new_school_scaled)
    return y_pred[0]

def recommend_feature_improve(new_school_scaled):
    recommendations = {}
    
    # Since there's only one school, we don't need to loop
    school_row = new_school_scaled.iloc[0]
    
    # Get top 3 features with the lowest scores
    low_score_features = school_row.sort_values().head(3)
    recommendations = low_score_features.index.tolist()
    
    return recommendations

def analyze_new_school(new_school_data):
    # Step 1: Preprocess
    new_school_scaled = preprocess_new_school_ssa(new_school_data)
    
    # Step 2: Standardization Percentage
    standardization_percentage = calculate_standardization_percentage(new_school_scaled)
    
    # Add the standardization percentage to the DataFrame (optional)
    new_school_scaled["Standardization percentage"] = standardization_percentage
    
    # Step 3: Feature Improvement Recommendations
    recommendations = recommend_feature_improve(new_school_scaled)
    
    return recommendations,standardization_percentage
