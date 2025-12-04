from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Model paths
MODEL_PATH = 'models/dropout_model.pkl'
SCALER_PATH = 'models/scaler.pkl'

# Initialize model and scaler
model = None
scaler = None

def load_or_create_model():
    """Load existing model or create new one"""
    global model, scaler
    
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            logger.info("Loading existing model...")
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            logger.info("Model loaded successfully")
        else:
            logger.info("Creating new model...")
            model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
            scaler = StandardScaler()
            os.makedirs('models', exist_ok=True)
            logger.info("New model created")
    except Exception as e:
        logger.error(f"Error loading/creating model: {e}")
        raise

# Load model on startup
load_or_create_model()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'VidyaVriksh ML Prediction Service',
        'version': '1.0.0'
    })

@app.route('/predict/dropout', methods=['POST'])
def predict_dropout():
    """Predict dropout risk for a student"""
    try:
        data = request.json
        logger.info(f"Prediction request for student: {data.get('studentId')}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        features = extract_features(data)
        risk_score = calculate_risk_score(features)
        risk_level = determine_risk_level(risk_score)
        risk_factors = identify_risk_factors(data)
        recommendations = generate_recommendations(risk_factors)
        
        response = {
            'studentId': data.get('studentId'),
            'riskScore': float(risk_score),
            'riskLevel': risk_level,
            'riskFactors': risk_factors,
            'recommendations': recommendations
        }
        
        logger.info(f"Prediction completed: {risk_level} risk ({risk_score:.2f})")
        return jsonify(response), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Process multiple students at once"""
    try:
        data = request.json
        students = data.get('students', [])
        
        if not students:
            return jsonify({'error': 'No students provided'}), 400
        
        logger.info(f"Batch prediction for {len(students)} students")
        
        predictions = []
        for student in students:
            try:
                features = extract_features(student)
                risk_score = calculate_risk_score(features)
                
                predictions.append({
                    'studentId': student.get('studentId'),
                    'riskScore': float(risk_score),
                    'riskLevel': determine_risk_level(risk_score)
                })
            except Exception as e:
                logger.error(f"Error processing student {student.get('studentId')}: {e}")
                predictions.append({
                    'studentId': student.get('studentId'),
                    'error': str(e)
                })
        
        return jsonify({'predictions': predictions}), 200
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({'error': str(e)}), 500

def extract_features(data):
    """Extract and normalize features from student data"""
    attendance = float(data.get('attendancePercentage', 100))
    gpa = float(data.get('gpa', 10))
    absences = int(data.get('absences', 0))
    participation = float(data.get('participationScore', 0.8))
    behavioral = int(data.get('behavioralIssues', 0))
    
    if not (0 <= attendance <= 100):
        raise ValueError("Attendance must be between 0 and 100")
    if not (0 <= gpa <= 10):
        raise ValueError("GPA must be between 0 and 10")
    if absences < 0:
        raise ValueError("Absences cannot be negative")
    
    features = {
        'attendance': attendance / 100.0,
        'gpa': gpa / 10.0,
        'absences': min(absences / 30.0, 1.0),
        'participation': participation,
        'behavioral_issues': min(behavioral / 10.0, 1.0)
    }
    
    return features

def calculate_risk_score(features):
    """Calculate dropout risk score using weighted features"""
    weights = {
        'attendance': 0.30,
        'gpa': 0.35,
        'absences': 0.15,
        'participation': 0.10,
        'behavioral_issues': 0.10
    }
    
    risk = 0
    risk += weights['attendance'] * (1 - features['attendance'])
    risk += weights['gpa'] * (1 - features['gpa'])
    risk += weights['absences'] * features['absences']
    risk += weights['participation'] * (1 - features['participation'])
    risk += weights['behavioral_issues'] * features['behavioral_issues']
    
    return np.clip(risk, 0, 1)

def determine_risk_level(risk_score):
    """Determine risk level category"""
    if risk_score < 0.3:
        return 'LOW'
    elif risk_score < 0.6:
        return 'MEDIUM'
    else:
        return 'HIGH'

def identify_risk_factors(original_data):
    """Identify specific risk factors"""
    risk_factors = []
    
    attendance = original_data.get('attendancePercentage', 100)
    if attendance < 75:
        risk_factors.append(f"Low attendance ({attendance:.1f}%)")
    
    gpa = original_data.get('gpa', 10)
    if gpa < 5.0:
        risk_factors.append(f"Low GPA ({gpa:.2f}/10)")
    
    absences = original_data.get('absences', 0)
    if absences > 15:
        risk_factors.append(f"High number of absences ({absences})")
    
    participation = original_data.get('participationScore', 1.0)
    if participation < 0.5:
        risk_factors.append("Low class participation")
    
    behavioral = original_data.get('behavioralIssues', 0)
    if behavioral > 3:
        risk_factors.append(f"Behavioral issues reported ({behavioral})")
    
    return risk_factors if risk_factors else ['No significant risk factors']

def generate_recommendations(risk_factors):
    """Generate actionable recommendations based on risk factors"""
    recommendations = set()
    
    for factor in risk_factors:
        factor_lower = factor.lower()
        
        if 'attendance' in factor_lower:
            recommendations.add("Schedule one-on-one meeting to discuss attendance barriers")
            recommendations.add("Connect with parents regarding attendance concerns")
        
        if 'gpa' in factor_lower or 'grade' in factor_lower:
            recommendations.add("Provide additional tutoring or academic support")
            recommendations.add("Create personalized learning plan")
        
        if 'absence' in factor_lower:
            recommendations.add("Investigate reasons for frequent absences")
        
        if 'participation' in factor_lower:
            recommendations.add("Encourage participation through gamification")
            recommendations.add("Assign group projects for engagement")
        
        if 'behavioral' in factor_lower:
            recommendations.add("Refer to counselor for behavioral support")
            recommendations.add("Implement positive reinforcement strategies")
    
    if not recommendations:
        recommendations.add("Continue monitoring student progress")
    
    return list(recommendations)

if __name__ == '__main__':
    logger.info("Starting VidyaVriksh ML Service...")
app.run(host='127.0.0.1', port=5000, debug=True)