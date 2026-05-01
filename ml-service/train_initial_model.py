"""
Train the VidyaVriksh dropout prediction model and save it to models/
Run this script once from the ml-service directory:

    cd Vidyavriksh-platform/ml-service
    python train_initial_model.py

Output:
    models/dropout_model.pkl
    models/scaler.pkl
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
import os

# ── Output paths ─────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
MODEL_PATH  = os.path.join(MODELS_DIR, 'dropout_model.pkl')
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')

# ── Feature columns (must stay in this order everywhere) ─────────────────────────
FEATURE_COLUMNS = [
    'attendancePercentage',
    'gpa',
    'absences',
    'participationScore',
    'behavioralIssues'
]


def generate_sample_data(n_samples: int = 1000) -> pd.DataFrame:
    """Generate realistic synthetic training data."""
    print(f"  Generating {n_samples} synthetic records...")
    rng = np.random.default_rng(42)

    attendance    = rng.uniform(50, 100, n_samples)
    gpa           = rng.uniform(2, 10,  n_samples)
    absences      = rng.integers(0, 40, n_samples).astype(float)
    participation = rng.uniform(0.3, 1.0, n_samples)
    behavioral    = rng.integers(0, 10, n_samples).astype(float)

    dropout_prob = (
        0.30 * (1 - attendance / 100) +
        0.35 * (1 - gpa / 10) +
        0.15 * np.clip(absences / 30, 0, 1) +
        0.10 * (1 - participation) +
        0.10 * np.clip(behavioral / 10, 0, 1)
    )
    dropout_prob = np.clip(dropout_prob + rng.normal(0, 0.1, n_samples), 0, 1)
    dropped_out  = (dropout_prob > 0.6).astype(int)

    return pd.DataFrame({
        'attendancePercentage': attendance,
        'gpa':                  gpa,
        'absences':             absences,
        'participationScore':   participation,
        'behavioralIssues':     behavioral,
        'droppedOut':           dropped_out
    })


def train_model():
    print("\n=== VidyaVriksh ML Model Training ===\n")

    # ── 1. Data ───────────────────────────────────────────────────────────────────
    df = generate_sample_data(1000)
    print(f"  Dataset shape : {df.shape}")
    print(f"  Dropout rate  : {df['droppedOut'].mean():.2%}")

    X = df[FEATURE_COLUMNS]
    y = df['droppedOut']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n  Training samples : {len(X_train)}")
    print(f"  Test samples     : {len(X_test)}")

    # ── 2. Scale ──────────────────────────────────────────────────────────────────
    print("\n  Fitting StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    # ── 3. Train ──────────────────────────────────────────────────────────────────
    print("  Training GradientBoostingClassifier...")
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # ── 4. Evaluate ───────────────────────────────────────────────────────────────
    y_pred       = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

    print("\n=== Model Performance ===")
    print(classification_report(y_test, y_pred,
                                target_names=['No Dropout', 'Dropout']))
    print(f"ROC-AUC : {roc_auc_score(y_test, y_pred_proba):.4f}")

    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives  : {cm[0][0]}")
    print(f"  False Positives : {cm[0][1]}")
    print(f"  False Negatives : {cm[1][0]}")
    print(f"  True Positives  : {cm[1][1]}")

    print("\n=== Feature Importances ===")
    for feat, imp in sorted(zip(FEATURE_COLUMNS, model.feature_importances_),
                            key=lambda x: x[1], reverse=True):
        bar = '█' * int(imp * 50)
        print(f"  {feat:25s}: {imp:.4f}  {bar}")

    # ── 5. Save ───────────────────────────────────────────────────────────────────
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model,  MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print(f"\n✅  Saved  →  {MODEL_PATH}")
    print(f"✅  Saved  →  {SCALER_PATH}")

    # ── 6. Quick smoke-test ───────────────────────────────────────────────────────
    print("\n=== Smoke Test (high-risk student) ===")
    test = pd.DataFrame([{
        'attendancePercentage': 65,
        'gpa':                  4.5,
        'absences':             20,
        'participationScore':   0.4,
        'behavioralIssues':     5
    }], columns=FEATURE_COLUMNS)

    test_scaled = scaler.transform(test)
    risk = model.predict_proba(test_scaled)[0][1]
    print(f"  Dropout probability : {risk:.2%}")
    print("\n=== Training Complete ===\n")


if __name__ == '__main__':
    train_model()