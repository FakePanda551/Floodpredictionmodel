"""
Flask API for Flood Risk Prediction
Serves the trained ML model via REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
from geopy.geocoders import Nominatim
import random

app = Flask(__name__)
CORS(app)

# Load model and encoders
try:
    model = joblib.load('flood_model.pkl')
    le_landcover = joblib.load('landcover_encoder.pkl')
    le_soiltype = joblib.load('soiltype_encoder.pkl')
    
    with open('model_metadata.json', 'r') as f:
        metadata = json.load(f)
    
    print("✅ Model loaded successfully")
    print(f"Model accuracy: {metadata['accuracy']:.4f}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

geolocator = Nominatim(user_agent="flood_guard_ai")

def get_location_data(city):
    """Get coordinates for a city"""
    try:
        location = geolocator.geocode(city + ", India")
        if location:
            return location.latitude, location.longitude
        return None, None
    except:
        return None, None

def simulate_weather_data(lat, lon):
    """Simulate weather data based on location (in production, use real API)"""
    # For demo: generate realistic values with some location-based variation
    base_seed = int((lat + lon) * 1000) % 10000
    random.seed(base_seed)
    
    return {
        'rainfall': round(random.uniform(50, 250), 2),
        'temperature': round(random.uniform(20, 40), 2),
        'humidity': round(random.uniform(30, 90), 2),
        'river_discharge': round(random.uniform(500, 4500), 2),
        'water_level': round(random.uniform(1, 9), 2),
        'elevation': round(random.uniform(100, 8000), 2),
        'population_density': round(random.uniform(2000, 8500), 2),
        'infrastructure': random.choice([0, 1]),
        'historical_floods': random.choice([0, 1]),
        'land_cover': random.choice(metadata['landcover_classes']),
        'soil_type': random.choice(metadata['soiltype_classes'])
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'accuracy': metadata.get('accuracy') if model else None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        city = data.get('city')
        
        if not city:
            return jsonify({'error': 'City name required'}), 400
        
        # Get location
        lat, lon = get_location_data(city)
        
        if lat is None:
            return jsonify({'error': f'Could not find location: {city}'}), 404
        
        # Get weather data (simulated for demo)
        weather = simulate_weather_data(lat, lon)
        
        # Encode categorical features
        land_cover_encoded = le_landcover.transform([weather['land_cover']])[0]
        soil_type_encoded = le_soiltype.transform([weather['soil_type']])[0]
        
        # Prepare features in correct order
        features = np.array([[
            weather['rainfall'],
            weather['temperature'],
            weather['humidity'],
            weather['river_discharge'],
            weather['water_level'],
            weather['elevation'],
            weather['population_density'],
            weather['infrastructure'],
            weather['historical_floods'],
            land_cover_encoded,
            soil_type_encoded
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]
        
        # Calculate risk score (0-100)
        risk_score = round(probability[1] * 100, 1)
        
        # Determine risk level
        if risk_score < 30:
            risk_level = 'low'
        elif risk_score < 70:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Get feature importance for this prediction
        feature_names = [
            'Rainfall', 'Temperature', 'Humidity', 'River Discharge',
            'Water Level', 'Elevation', 'Population Density',
            'Infrastructure', 'Historical Floods', 'Land Cover', 'Soil Type'
        ]
        
        # Create factor contributions based on feature importance
        factors = []
        importances = metadata['feature_importance'][:5]  # Top 5
        
        for imp in importances:
            feature_name = imp['feature'].replace(' (mm)', '').replace(' (°C)', '').replace(' (%)', '').replace(' (m³/s)', '').replace(' (m)', '').replace(' Encoded', '')
            factors.append({
                'name': feature_name,
                'contribution': round(imp['importance'] * 100, 1),
                'description': f'Contributing {round(imp["importance"] * 100, 1)}% to flood risk assessment'
            })
        
        return jsonify({
            'city': city,
            'riskScore': risk_score,
            'riskLevel': risk_level,
            'weather': {
                'temperature': weather['temperature'],
                'rainfall': weather['rainfall'],
                'humidity': weather['humidity'],
                'windSpeed': round(random.uniform(5, 30), 1)  # Not in dataset
            },
            'factors': factors,
            'model_accuracy': metadata['accuracy']
        })
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
