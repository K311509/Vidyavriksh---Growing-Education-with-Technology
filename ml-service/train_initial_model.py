"""
Script to train initial dropout prediction model with sample data
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
import os

def generate_sample_data(n_samples=1000):
    """Generate synthetic training data"""
    print(f"Generating {n_samples} sample records...")
    rng = np.random.default_rng(42)
    
    data = []
    for _ in range(n_samples):
        attendance = rng.uniform(50, 100)
        gpa = rng.uniform(2, 10)
        absences = rng.integers(0, 40)
        participation = rng.uniform(0.3, 1.0)
        behavioral = rng.integers(0, 10)
        
        dropout_prob = (
            0.3 * (1 - attendance/100) +
            0.35 * (1 - gpa/10) +
            0.15 * min(absences/30, 1.0) +
            0.1 * (1 - participation) +
            0.1 * min(behavioral/10, 1.0)
        )
        
        dropout_prob += rng.normal(0, 0.1)
        dropout_prob = np.clip(dropout_prob, 0, 1)
        
        dropped_out = 1 if dropout_prob > 0.6 else 0
        
        data.append({
            'attendancePercentage': attendance,
            'gpa': gpa,
            'absences': absences,
            'participationScore': participation,
            'behavioralIssues': behavioral,
            'droppedOut': dropped_out
        })
    
    return pd.DataFrame(data)

def train_model():
    """Train and save the dropout prediction model"""
    print("\n=== VidyaVriksh ML Model Training ===\n")
    
    df = generate_sample_data(1000)
    
    print(f"Data shape: {df.shape}")
    print(f"Dropout rate: {df['droppedOut'].mean():.2%}")
    
    X = df[['attendancePercentage', 'gpa', 'absences', 
            'participationScore', 'behavioralIssues']]
    y = df['droppedOut']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    print("\nScaling features...")
    scaler = StandardScaler()
    x_train_scaled = scaler.fit_transform(X_train)
    x_test_scaled = scaler.transform(X_test)
    
    print("\nTraining Gradient Boosting model...")
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(x_train_scaled, y_train)
    
    print("\n=== Model Performance ===")
    y_pred = model.predict(x_test_scaled)
    y_pred_proba = model.predict_proba(x_test_scaled)[:, 1]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, 
                                target_names=['No Dropout', 'Dropout']))
    
    print(f"\nROC-AUC Score: {roc_auc_score(y_test, y_pred_proba):.4f}")
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"True Negatives: {cm[0][0]}")
    print(f"False Positives: {cm[0][1]}")
    print(f"False Negatives: {cm[1][0]}")
    print(f"True Positives: {cm[1][1]}")
    
    print("\n=== Feature Importance ===")
    for feature, importance in sorted(zip(X.columns, model.feature_importances_), 
                                     key=lambda x: x[1], reverse=True):
        bar = '█' * int(importance * 50)
        print(f"{feature:25s}: {importance:.4f} {bar}")
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/dropout_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("\n✅ Model saved successfully!")
    print("   - models/dropout_model.pkl")
    print("   - models/scaler.pkl")
    
    print("\n=== Test Prediction ===")
    test_student = pd.DataFrame([{
        'attendancePercentage': 65,
        'gpa': 4.5,
        'absences': 20,
        'participationScore': 0.4,
        'behavioralIssues': 5
    }])
    
    test_scaled = scaler.transform(test_student)
    risk = model.predict_proba(test_scaled)[0][1]
    print(f"Test student dropout risk: {risk:.2%}")
    
    print("\n=== Training Complete ===\n")

if __name__ == '__main__':
    train_model()