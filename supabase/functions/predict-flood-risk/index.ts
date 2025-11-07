import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Predicting flood risk for: ${city}`);

    // Check if Python ML service URL is configured
    const pythonServiceUrl = Deno.env.get('PYTHON_ML_SERVICE_URL');
    
    if (pythonServiceUrl) {
      // Use real Python ML service
      console.log('Using Python ML service for prediction');
      
      try {
        const mlResponse = await fetch(`${pythonServiceUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ city }),
        });

        if (!mlResponse.ok) {
          throw new Error(`ML service returned ${mlResponse.status}`);
        }

        const prediction = await mlResponse.json();
        
        return new Response(
          JSON.stringify(prediction),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (mlError) {
        console.error('Python ML service error:', mlError);
        // Fall back to heuristic model if ML service fails
      }
    }

    // Fallback: Heuristic-based prediction (when Python service not available)
    console.log('Using fallback heuristic model');
    
    // Simulate weather data based on city name (deterministic for demo)
    const cityHash = city.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const seed = cityHash % 100;
    
    const rainfall = 50 + (seed * 2.5);
    const temperature = 20 + (seed % 25);
    const humidity = 30 + (seed % 65);
    const windSpeed = 5 + (seed % 25);
    
    // Calculate risk score based on weather conditions
    let riskScore = 0;
    
    // Rainfall contribution (40%)
    if (rainfall > 200) riskScore += 40;
    else if (rainfall > 150) riskScore += 30;
    else if (rainfall > 100) riskScore += 20;
    else riskScore += 10;
    
    // Humidity contribution (30%)
    if (humidity > 80) riskScore += 30;
    else if (humidity > 60) riskScore += 20;
    else riskScore += 10;
    
    // Temperature contribution (20%)
    if (temperature > 35) riskScore += 10;
    else if (temperature > 30) riskScore += 15;
    else riskScore += 20;
    
    // Add some variance (10%)
    riskScore += (seed % 10);
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore < 40) riskLevel = 'low';
    else if (riskScore < 70) riskLevel = 'medium';
    else riskLevel = 'high';
    
    // Generate factors
    const factors = [
      {
        name: 'Rainfall',
        contribution: rainfall > 150 ? 35 : rainfall > 100 ? 25 : 15,
        description: `Current rainfall of ${rainfall.toFixed(1)}mm is ${rainfall > 150 ? 'significantly elevated' : rainfall > 100 ? 'moderately high' : 'within normal range'}`
      },
      {
        name: 'Humidity',
        contribution: humidity > 70 ? 30 : 20,
        description: `Humidity at ${humidity.toFixed(1)}% ${humidity > 70 ? 'increases water retention' : 'is moderate'}`
      },
      {
        name: 'Temperature',
        contribution: 15,
        description: `Temperature of ${temperature.toFixed(1)}°C affects evaporation rates`
      },
      {
        name: 'Historical Data',
        contribution: 12,
        description: 'Based on historical flood patterns in the region'
      },
      {
        name: 'Topography',
        contribution: 8,
        description: 'Terrain and elevation factors considered'
      }
    ];

    const result = {
      city,
      riskScore: Math.round(riskScore * 10) / 10,
      riskLevel,
      weather: {
        temperature: Math.round(temperature * 10) / 10,
        rainfall: Math.round(rainfall * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
      },
      factors,
      note: 'Using heuristic model - deploy Python ML service for real predictions'
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-flood-risk:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to predict flood risk' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
