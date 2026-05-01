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

# ─── Model paths ────────────────────────────────────────────────────────────────
# Place dropout_model.pkl and scaler.pkl inside a 'models/' folder next to app.py
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, 'models', 'dropout_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')

# ─── Global model references ────────────────────────────────────────────────────
model  = None
scaler = None

# ─── Feature column order must match what the model was trained on ───────────────
FEATURE_COLUMNS = [
    'attendancePercentage',
    'gpa',
    'absences',
    'participationScore',
    'behavioralIssues'
]


def load_model():
    """Load trained model and scaler from disk. Raises if files are missing."""
    global model, scaler

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}\n"
            "Run train_initial_model.py first, then copy the generated\n"
            "'models/dropout_model.pkl' and 'models/scaler.pkl' next to app.py."
        )
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler file not found: {SCALER_PATH}\n"
            "Run train_initial_model.py first."
        )

    logger.info("Loading model from %s", MODEL_PATH)
    model  = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    logger.info(
        "Model loaded: %s  |  features: %d  |  classes: %s",
        type(model).__name__, model.n_features_in_, model.classes_
    )


# Load on startup
load_model()


# ────────────────────────────────────────────────────────────────────────────────
#  Routes
# ────────────────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status':  'healthy',
        'service': 'VidyaVriksh ML Prediction Service',
        'version': '1.0.0',
        'model':   type(model).__name__ if model else 'not loaded'
    })


@app.route('/predict/dropout', methods=['POST'])
def predict_dropout():
    """Predict dropout risk for a single student."""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        logger.info("Prediction request for student: %s", data.get('studentId'))

        # ── Validate & build feature row ────────────────────────────────────────
        raw_features = validate_and_extract(data)          # dict of raw values
        feature_df   = build_feature_df(raw_features)      # 1-row DataFrame

        # ── Scale then predict with the TRAINED MODEL ────────────────────────────
        scaled       = scaler.transform(feature_df)
        risk_score   = float(model.predict_proba(scaled)[0][1])   # P(dropout)

        # ── Interpret result ─────────────────────────────────────────────────────
        risk_level       = determine_risk_level(risk_score)
        risk_factors     = identify_risk_factors(data)
        recommendations  = generate_recommendations(risk_factors)

        response = {
            'studentId':       data.get('studentId'),
            'riskScore':       round(risk_score, 4),
            'riskLevel':       risk_level,
            'riskFactors':     risk_factors,
            'recommendations': recommendations
        }

        logger.info("Prediction done: %s risk (%.4f)", risk_level, risk_score)
        return jsonify(response), 200

    except ValueError as e:
        logger.error("Validation error: %s", e)
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Prediction error: %s", e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Predict dropout risk for multiple students in one call."""
    try:
        data     = request.json
        students = data.get('students', [])

        if not students:
            return jsonify({'error': 'No students provided'}), 400

        logger.info("Batch prediction for %d students", len(students))

        # ── Build a single DataFrame for all students (faster than looping) ──────
        rows   = []
        errors = {}

        for student in students:
            try:
                raw = validate_and_extract(student)
                rows.append({'_id': student.get('studentId'), **raw})
            except ValueError as e:
                errors[student.get('studentId')] = str(e)

        predictions = []

        if rows:
            ids        = [r.pop('_id') for r in rows]
            feature_df = pd.DataFrame(rows, columns=FEATURE_COLUMNS)
            scaled     = scaler.transform(feature_df)
            probs      = model.predict_proba(scaled)[:, 1]   # P(dropout) per student

            for sid, prob in zip(ids, probs):
                predictions.append({
                    'studentId': sid,
                    'riskScore': round(float(prob), 4),
                    'riskLevel': determine_risk_level(float(prob))
                })

        # Append any students that failed validation
        for sid, err in errors.items():
            predictions.append({'studentId': sid, 'error': err})

        return jsonify({'predictions': predictions}), 200

    except Exception as e:
        logger.error("Batch prediction error: %s", e)
        return jsonify({'error': str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────────
#  Helper functions
# ────────────────────────────────────────────────────────────────────────────────

def validate_and_extract(data: dict) -> dict:
    """
    Validate input fields and return a dict of raw (un-scaled) feature values.
    Column order matches FEATURE_COLUMNS / training data exactly.
    """
    attendance    = float(data.get('attendancePercentage', 100))
    gpa           = float(data.get('gpa', 10))
    absences      = int(data.get('absences', 0))
    participation = float(data.get('participationScore', 0.8))
    behavioral    = int(data.get('behavioralIssues', 0))

    if not (0 <= attendance <= 100):
        raise ValueError("attendancePercentage must be 0–100")
    if not (0 <= gpa <= 10):
        raise ValueError("gpa must be 0–10")
    if absences < 0:
        raise ValueError("absences cannot be negative")
    if not (0.0 <= participation <= 1.0):
        raise ValueError("participationScore must be 0.0–1.0")
    if behavioral < 0:
        raise ValueError("behavioralIssues cannot be negative")

    # Return in the exact column order the model was trained on
    return {
        'attendancePercentage': attendance,
        'gpa':                  gpa,
        'absences':             absences,
        'participationScore':   participation,
        'behavioralIssues':     behavioral
    }


def build_feature_df(raw: dict) -> pd.DataFrame:
    """Wrap raw feature dict in a one-row DataFrame with correct column order."""
    return pd.DataFrame([raw], columns=FEATURE_COLUMNS)


def determine_risk_level(risk_score: float) -> str:
    if risk_score < 0.3:
        return 'LOW'
    elif risk_score < 0.6:
        return 'MEDIUM'
    return 'HIGH'


def identify_risk_factors(data: dict) -> list:
    """Return a human-readable list of triggered risk factors."""
    factors = []

    attendance = float(data.get('attendancePercentage', 100))
    if attendance < 75:
        factors.append(f"Low attendance ({attendance:.1f}%)")

    gpa = float(data.get('gpa', 10))
    if gpa < 5.0:
        factors.append(f"Low GPA ({gpa:.2f}/10)")

    absences = int(data.get('absences', 0))
    if absences > 15:
        factors.append(f"High absences ({absences})")

    participation = float(data.get('participationScore', 1.0))
    if participation < 0.5:
        factors.append("Low class participation")

    behavioral = int(data.get('behavioralIssues', 0))
    if behavioral > 3:
        factors.append(f"Behavioral issues reported ({behavioral})")

    return factors if factors else ['No significant risk factors']


def generate_recommendations(risk_factors: list) -> list:
    """Return actionable recommendations based on detected risk factors."""
    recommendations = set()

    for factor in risk_factors:
        f = factor.lower()
        if 'attendance' in f:
            recommendations.add("Schedule a 1-on-1 to discuss attendance barriers")
            recommendations.add("Contact parents/guardians regarding attendance")
        if 'gpa' in f or 'grade' in f:
            recommendations.add("Arrange tutoring or additional academic support")
            recommendations.add("Create a personalised learning plan")
        if 'absence' in f:
            recommendations.add("Investigate reasons for frequent absences")
        if 'participation' in f:
            recommendations.add("Encourage participation through gamification")
            recommendations.add("Assign group projects to improve engagement")
        if 'behavioral' in f:
            recommendations.add("Refer student to counsellor for behavioural support")
            recommendations.add("Implement positive reinforcement strategies")

    if not recommendations:
        recommendations.add("Continue monitoring student progress")

    return list(recommendations)


# ────────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    logger.info("Starting VidyaVriksh ML Service...")
    app.run(host='127.0.0.1', port=5000, debug=True)