# Flood Risk Prediction ML Service

This Python service trains and serves a Random Forest model for flood risk prediction using real Indian flood data.

## Setup

1. **Install dependencies:**
```bash
cd python
pip install -r requirements.txt
```

2. **Train the model:**
```bash
python train_model.py
```

This will:
- Load the flood dataset
- Train a Random Forest classifier
- Save the model to `flood_model.pkl`
- Save encoders and metadata

3. **Run the prediction API:**
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
```

### Predict Flood Risk
```bash
POST /predict
Content-Type: application/json

{
  "city": "Mumbai"
}
```

Response:
```json
{
  "city": "Mumbai",
  "riskScore": 75.3,
  "riskLevel": "high",
  "weather": {
    "temperature": 32.5,
    "rainfall": 185.2,
    "humidity": 78.5,
    "windSpeed": 15.3
  },
  "factors": [...],
  "model_accuracy": 0.8542
}
```

## Model Details

- **Algorithm:** Random Forest Classifier
- **Features:** 11 environmental and geographical factors
- **Dataset:** 10,000 flood incidents from India
- **Accuracy:** ~85% on test set

## Integration with Edge Function

Update the `PYTHON_ML_SERVICE_URL` secret in Supabase to point to your deployed Python service, then the edge function will automatically use it.
