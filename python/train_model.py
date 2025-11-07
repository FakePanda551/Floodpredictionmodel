"""
Flood Risk Prediction Model Training Script
Trains a Random Forest model on the Indian flood dataset
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json

# Load dataset
df = pd.read_csv('../public/flood_risk_dataset_india.csv')

print(f"Dataset loaded: {len(df)} rows")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFlood distribution:\n{df['Flood Occurred'].value_counts()}")

# Prepare features
features = [
    'Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)',
    'River Discharge (m³/s)', 'Water Level (m)', 'Elevation (m)',
    'Population Density', 'Infrastructure', 'Historical Floods'
]

# Encode categorical variables
le_landcover = LabelEncoder()
le_soiltype = LabelEncoder()

df['Land Cover Encoded'] = le_landcover.fit_transform(df['Land Cover'])
df['Soil Type Encoded'] = le_soiltype.fit_transform(df['Soil Type'])

features.extend(['Land Cover Encoded', 'Soil Type Encoded'])

X = df[features]
y = df['Flood Occurred']

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")

# Train Random Forest model
print("\nTraining Random Forest model...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy:.4f}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(f"\nTop 5 Important Features:")
print(feature_importance.head())

# Save model and encoders
joblib.dump(model, 'flood_model.pkl')
joblib.dump(le_landcover, 'landcover_encoder.pkl')
joblib.dump(le_soiltype, 'soiltype_encoder.pkl')

# Save feature names and metadata
metadata = {
    'features': features,
    'accuracy': float(accuracy),
    'landcover_classes': le_landcover.classes_.tolist(),
    'soiltype_classes': le_soiltype.classes_.tolist(),
    'feature_importance': feature_importance.to_dict('records')
}

with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Model saved to flood_model.pkl")
print("✅ Encoders saved")
print("✅ Metadata saved to model_metadata.json")
